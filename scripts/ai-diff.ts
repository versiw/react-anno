import { execFileSync, spawn } from 'child_process'
import os from 'os'
import fs from 'fs'
import path from 'path'

const IGNORED_FILES = [
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'bun.lockb',
  '*.map',
  'dist/*',
  'node_modules/*'
]

function getGitArgs(isStaged: boolean = false): string[] {
  const args = ['diff']
  if (isStaged) args.push('--staged')
  args.push('--', '.')
  IGNORED_FILES.forEach((file) => args.push(`:(exclude)${file}`))
  return args
}

function getUntrackedFiles(): string[] {
  try {
    const args = ['ls-files', '--others', '--exclude-standard', '--', '.']
    IGNORED_FILES.forEach((file) => args.push(`:(exclude)${file}`))

    const output = execFileSync('git', args, { encoding: 'utf-8' })
    return output.split('\n').filter((line) => line.trim() !== '')
  } catch {
    console.warn('⚠️ 获取未跟踪文件失败，将忽略新增文件。')
    return []
  }
}

function generateNewFileDiff(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')

    let diff = `diff --git a/${filePath} b/${filePath}\n`
    diff += `new file mode 100644\n`
    diff += `--- /dev/null\n`
    diff += `+++ b/${filePath}\n`
    diff += `@@ -0,0 +1,${lines.length} @@\n`
    diff += lines.map((line) => '+' + line).join('\n')
    diff += '\n'

    return diff
  } catch {
    console.warn(`⚠️ 无法读取新文件: ${filePath} (可能是二进制文件或权限不足)`)
    return ''
  }
}

async function copyToClipboard(text: string): Promise<void> {
  const platform = os.platform()

  if (platform === 'win32') {
    const tempFile = path.join(os.tmpdir(), `ai_diff_${Date.now()}.txt`)

    try {
      fs.writeFileSync(tempFile, text, 'utf8')
      const psCommand = `Get-Content -Path '${tempFile}' -Encoding UTF8 -Raw | Set-Clipboard`
      execFileSync('powershell', ['-noprofile', '-command', psCommand])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(`Windows 剪贴板写入失败: ${errorMessage}`)
    } finally {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile)
      }
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

function wrapForAI(diffContent: string): string {
  return `我修改了代码，以下是 Git Diff 变更记录。请帮我分析：
1. 总结主要修改了哪些功能模块？
2. 分析这些新增代码的具体作用和逻辑。
3. 检查是否存在潜在的 Bug 或类型安全问题。
4. 评价代码为实现其目的是否遵循了最佳实现、代码质量如何、有无其它更好的建议和优化措施。
5. 提供本次修改的中文版本 git commit message。

\`\`\`diff
${diffContent}
\`\`\``
}

async function main() {
  try {
    const args = process.argv.slice(2)
    const isStaged = args.includes('--staged')

    console.log(`🔍 正在生成 ${isStaged ? '已暂存 (Staged)' : '未暂存 (Working Tree)'} 的 Diff...`)

    const gitArgs = getGitArgs(isStaged)
    let diffOutput = ''

    try {
      diffOutput = execFileSync('git', gitArgs, { encoding: 'utf-8' })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(`Git 执行失败: ${errorMessage}`)
    }

    if (!isStaged) {
      const untrackedFiles = getUntrackedFiles()
      if (untrackedFiles.length > 0) {
        console.log(`📄 检测到 ${untrackedFiles.length} 个新增文件...`)
        const newFilesDiff = untrackedFiles.map((file) => generateNewFileDiff(file)).join('\n')

        if (newFilesDiff) {
          diffOutput = diffOutput ? `${diffOutput}\n${newFilesDiff}` : newFilesDiff
        }
      }
    }

    if (!diffOutput.trim()) {
      console.log('⚠️  当前没有检测到代码变更。')
      return
    }

    const finalContent = wrapForAI(diffOutput)

    await copyToClipboard(finalContent)

    const lineCount = finalContent.split('\n').length
    console.log(`✅ 成功！已将 AI Prompt 复制到剪贴板 (共 ${lineCount} 行)。`)
    console.log(`👉 请直接粘贴。`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ 发生错误:', errorMessage)
  }
}

main()
