import { execFileSync, spawn } from 'child_process'
import os from 'os'
import fs from 'fs'
import path from 'path'

// =================================================================================
// 配置区域
// =================================================================================

const TEST_DIR = 'src/tests' // 指定测试目录

// Git Diff 忽略的文件
const DIFF_IGNORED_FILES = [
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'bun.lockb',
  '*.map',
  'dist/*',
  'node_modules/*',
  '*.d.ts' // 通常类型定义变更不需要体现在 diff 中给 AI 看，除非是类型测试
]

// 遍历测试目录时忽略的文件/文件夹
const CONTEXT_CONFIG = {
  excludedDirs: ['node_modules', '.git', 'coverage', '__snapshots__'],
  excludedFiles: ['.DS_Store'],
  excludedExtensions: [
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.mp4',
    '.zip',
    '.tar',
    '.gz',
    '.pdf',
    '.exe',
    '.dll',
    '.bin'
  ]
}

// =================================================================================
// 工具函数：剪贴板操作 (复用现有逻辑)
// =================================================================================

async function copyToClipboard(text: string): Promise<void> {
  const platform = os.platform()

  if (platform === 'win32') {
    const tempFile = path.join(os.tmpdir(), `ai_test_ctx_${Date.now()}.txt`)
    try {
      fs.writeFileSync(tempFile, text, 'utf8')
      const psCommand = `Get-Content -Path '${tempFile}' -Encoding UTF8 -Raw | Set-Clipboard`
      execFileSync('powershell', ['-noprofile', '-command', psCommand])
    } catch (error) {
      throw new Error(
        `Windows 剪贴板写入失败: ${error instanceof Error ? error.message : String(error)}`
      )
    } finally {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile)
    }
    return
  }

  return new Promise((resolve, reject) => {
    let command = ''
    let args: string[] = []
    if (platform === 'darwin') {
      command = 'pbcopy'
    } else {
      command = 'xclip'
      args = ['-selection', 'clipboard']
    }
    const proc = spawn(command, args)
    proc.on('error', (err) => reject(new Error(`Failed to run ${command}: ${err.message}`)))
    proc.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} exited with code ${code}`))
    })
    proc.stdin.write(text)
    proc.stdin.end()
  })
}

// =================================================================================
// 核心逻辑：获取 Diff
// =================================================================================

function getGitArgs(isStaged: boolean = false): string[] {
  const args = ['diff']
  if (isStaged) args.push('--staged')
  // 限制 diff 的上下文行数，减少 token 消耗，3行通常足够理解变更
  args.push('-U3')
  args.push('--', '.')
  DIFF_IGNORED_FILES.forEach((file) => args.push(`:(exclude)${file}`))
  return args
}

function getGitDiff(isStaged: boolean): string {
  try {
    const gitArgs = getGitArgs(isStaged)
    return execFileSync('git', gitArgs, { encoding: 'utf-8' })
  } catch (error) {
    throw new Error(`Git 执行失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// =================================================================================
// 核心逻辑：获取测试目录上下文
// =================================================================================

function getLanguage(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase()
  const map: Record<string, string> = {
    '.js': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'tsx',
    '.jsx': 'jsx',
    '.json': 'json',
    '.md': 'markdown'
  }
  return map[ext] || ''
}

function shouldProcessFile(fileName: string): boolean {
  if (CONTEXT_CONFIG.excludedFiles.includes(fileName)) return false
  const ext = path.extname(fileName).toLowerCase()
  if (CONTEXT_CONFIG.excludedExtensions.includes(ext)) return false
  return true
}

function traverseTestDirectory(currentPath: string, rootDir: string, result: string[]) {
  let entries: string[]
  try {
    entries = fs.readdirSync(currentPath)
  } catch (err) {
    return // 目录不存在或无法读取，跳过
  }

  entries.sort((a, b) => a.localeCompare(b))

  for (const entry of entries) {
    const fullPath = path.join(currentPath, entry)
    const relativePath = path.relative(rootDir, fullPath)

    // 获取文件状态
    let stats: fs.Stats
    try {
      stats = fs.statSync(fullPath)
    } catch {
      continue
    }

    if (stats.isDirectory()) {
      if (!CONTEXT_CONFIG.excludedDirs.includes(entry)) {
        traverseTestDirectory(fullPath, rootDir, result)
      }
    } else if (stats.isFile()) {
      if (shouldProcessFile(entry)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8')
          if (content.includes('\0')) continue // 跳过二进制

          const lang = getLanguage(entry)
          result.push(`# File: ${relativePath}`)
          result.push(`\`\`\`${lang}`)
          result.push(content)
          result.push(`\`\`\``)
          result.push('')
        } catch (e) {
          console.warn(`无法读取文件: ${relativePath}`)
        }
      }
    }
  }
}

// =================================================================================
// 组装 Prompt
// =================================================================================

function generatePrompt(diffContent: string, testContext: string): string {
  return `我正在进行代码开发，以下是本次的 Git 变更记录以及现有的测试用例上下文。

请基于这些信息，扮演一位资深的测试开发工程师 (QA Engineer) 和 TypeScript 专家，帮我完成测试覆盖工作。

---

### 第一部分：代码变更 (Git Diff)
\`\`\`diff
${diffContent}
\`\`\`

---

### 第二部分：现有测试上下文 (${TEST_DIR})
> 注意：以下是项目中已有的测试文件，请参考其测试风格、Mock 方式和工具库的使用。

${testContext || '（当前目录下暂无测试文件）'}

---

### 任务要求

请仔细分析上述代码变更和现有测试，执行以下操作：

1.  **分析变更影响**：
    *   简要总结修改了哪些业务逻辑。
    *   指出哪些现有测试可能被破坏。
    *   指出哪些新增功能目前缺乏测试覆盖。

2.  **生成/更新测试代码**：
    *   **修复现有测试**：如果变更导致现有测试失败，请提供修正后的代码。
    *   **新增测试用例**：针对新增的业务逻辑，编写新的单元测试或集成测试。
    *   **保持风格一致**：请严格遵循 "第二部分" 中展示的测试代码风格（例如使用 vitest 还是 jest，如何使用 renderHook，如何 mock store 等）。
    *   **边界情况**：请考虑边缘情况（Edge Cases）和错误处理的测试。

3.  **输出格式**：
    *   请直接提供完整的测试文件代码。
    *   提供的测试文件代码无需任何注释（除顶部文件路径注释外）。
    *   如果需要新建文件，请注明建议的文件路径。

请开始分析：
`
}

// =================================================================================
// 主程序
// =================================================================================

async function main() {
  try {
    const args = process.argv.slice(2)
    const isStaged = args.includes('--staged')
    const rootDir = process.cwd()
    const testFullPath = path.resolve(rootDir, TEST_DIR)

    console.log('🚀 正在启动 AI 测试辅助助手...')

    // 1. 获取 Diff
    console.log(
      `🔍 1/3 获取 ${isStaged ? '已暂存 (Staged)' : '未暂存 (Working Tree)'} 的代码变更...`
    )
    const diffContent = getGitDiff(isStaged)
    if (!diffContent.trim()) {
      console.log('⚠️  未检测到代码变更，请先修改代码或使用 git add 暂存。')
      return
    }

    // 2. 获取测试上下文
    console.log(`📂 2/3 读取测试目录上下文 (${TEST_DIR})...`)
    const testContextLines: string[] = []
    if (fs.existsSync(testFullPath)) {
      traverseTestDirectory(testFullPath, rootDir, testContextLines)
    } else {
      console.log(`⚠️  测试目录不存在: ${TEST_DIR}，将只提供变更记录。`)
    }
    const testContextContent = testContextLines.join('\n')

    // 3. 组装并复制
    console.log(`📋 3/3 组装 Prompt 并写入剪贴板...`)
    const finalPrompt = generatePrompt(diffContent, testContextContent)

    await copyToClipboard(finalPrompt)

    const lineCount = finalPrompt.split('\n').length
    console.log('\n==================================================')
    console.log(`✅ 成功！已复制 ${lineCount} 行内容到剪贴板。`)
    console.log(`👉 包含: Git Diff + ${TEST_DIR} 下的所有文件。`)
    console.log(`👉 请直接粘贴给 AI (ChatGPT / Claude / DeepSeek)。`)
    console.log('==================================================\n')
  } catch (error) {
    console.error('\n❌ 发生错误:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

main()
