/**
 * @Description: 指定目录生成 AI 上下文脚本
 * @Usage: npm run context <directory_path>
 * @Example: npm run context src/components
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

// 获取命令行参数（去掉 node 和 脚本路径）
const args = process.argv.slice(2)
const targetDirArg = args[0]

if (!targetDirArg) {
  console.error('❌ 请提供目标目录路径，例如: npm run context src/components')
  process.exit(1)
}

const rootDir = process.cwd()
// 解析目标绝对路径
const targetFullPath = path.resolve(rootDir, targetDirArg)

// 检查路径是否存在
if (!fs.existsSync(targetFullPath)) {
  console.error(`❌ 路径不存在: ${targetFullPath}`)
  process.exit(1)
}

// 生成输出文件名：project_context_src_components.md
const sanitizedName = targetDirArg
  .replace(/^\.\//, '') // 移除开头的 ./
  .replace(/[\\/]/g, '_') // 替换斜杠为下划线
  .replace(/^_/, '')

const OUTPUT_FILE = `project_context_${sanitizedName}.md`
const outputFilePath = path.join(rootDir, OUTPUT_FILE)

// =================================================================================
// 配置区域 (沿用你的配置)
// =================================================================================
const CONFIG = {
  // 这里可以只排除一些通用的系统目录，具体业务目录由参数控制
  excludedDirs: [
    'node_modules',
    '.git',
    '.next',
    '.vscode',
    'dist',
    'build',
    'coverage',
    'public',
    'releases'
  ],

  excludedFiles: [
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'bun.lockb',
    '.DS_Store',
    '.env',
    '.env.local',
    'CHANGELOG.md',
    // 排除自己生成的 context 文件
    ...fs.readdirSync(rootDir).filter((f) => f.startsWith('project_context'))
  ],

  excludedExtensions: [
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.ico',
    '.webp',
    '.mp4',
    '.mov',
    '.mp3',
    '.wav',
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.zip',
    '.tar',
    '.gz',
    '.7z',
    '.rar',
    '.exe',
    '.dll',
    '.bin',
    '.class',
    '.jar',
    '.eot',
    '.otf',
    '.ttf',
    '.woff',
    '.woff2'
  ]
}

// =================================================================================
// 核心逻辑
// =================================================================================

function shouldProcessFile(fileName: string): boolean {
  if (CONFIG.excludedFiles.includes(fileName)) return false
  const ext = path.extname(fileName).toLowerCase()
  if (CONFIG.excludedExtensions.includes(ext)) return false
  return true
}

function getLanguage(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase()
  const map: Record<string, string> = {
    '.js': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'tsx',
    '.jsx': 'jsx',
    '.json': 'json',
    '.css': 'css',
    '.scss': 'scss',
    '.less': 'less',
    '.html': 'html',
    '.md': 'markdown',
    '.py': 'python',
    '.sh': 'bash',
    '.yml': 'yaml',
    '.yaml': 'yaml',
    '.sql': 'sql',
    '.java': 'java',
    '.rs': 'rust',
    '.go': 'go',
    '.vue': 'vue'
  }
  return map[ext] || ''
}

function initOutputFile(): void {
  try {
    const header = [
      `# Project Context: ${targetDirArg}`,
      ``,
      `> Target Path: ${targetFullPath}`,
      `> Generated at: ${new Date().toLocaleString()}`,
      ``,
      `---`,
      ``,
      ``
    ].join('\n')

    fs.writeFileSync(outputFilePath, header, 'utf8')
    console.log(`✅ 文件已初始化: ${OUTPUT_FILE}`)
  } catch (error) {
    console.error(`❌ 初始化文件失败:`, error)
    process.exit(1)
  }
}

function appendFileContent(fullPath: string, relativeToRoot: string): void {
  try {
    const content = fs.readFileSync(fullPath, 'utf8')
    const language = getLanguage(relativeToRoot)

    // 简单的二进制检测
    if (content.includes('\0')) {
      return
    }

    const formattedContent = [
      `# File: ${relativeToRoot}`,
      ``,
      `\`\`\`${language}`,
      content,
      `\`\`\``,
      ``,
      `---`,
      ``,
      ``
    ].join('\n')

    fs.appendFileSync(outputFilePath, formattedContent, 'utf8')
    console.log(`📄 已写入: ${relativeToRoot}`)
  } catch (err: any) {
    console.error(`❌ 读取错误 ${relativeToRoot}:`, err.message)
  }
}

/**
 * 递归遍历目录
 * @param currentPath 当前绝对路径
 */
function traverseDirectory(currentPath: string): void {
  let entries: string[]
  try {
    entries = fs.readdirSync(currentPath)
  } catch (err: any) {
    // 如果传入的是文件而不是目录，直接处理文件
    if (currentPath === targetFullPath && fs.statSync(currentPath).isFile()) {
      const relativePath = path.relative(rootDir, currentPath)
      if (shouldProcessFile(path.basename(currentPath))) {
        appendFileContent(currentPath, relativePath)
      }
      return
    }
    console.error(`❌ 无法读取路径 ${currentPath}:`, err.message)
    return
  }

  // 排序优化阅读体验
  entries.sort((a, b) => a.localeCompare(b))

  for (const entry of entries) {
    const fullPath = path.join(currentPath, entry)
    const relativePath = path.relative(rootDir, fullPath)

    // 获取文件状态
    let stats: fs.Stats
    try {
      stats = fs.statSync(fullPath)
    } catch (err) {
      continue
    }

    if (stats.isDirectory()) {
      if (!CONFIG.excludedDirs.includes(entry)) {
        traverseDirectory(fullPath)
      }
    } else if (stats.isFile()) {
      if (shouldProcessFile(entry)) {
        appendFileContent(fullPath, relativePath)
      }
    }
  }
}

function main() {
  console.log(`🚀 开始提取上下文...`)
  console.log(`📂 目标: ${targetDirArg}`)

  initOutputFile()
  traverseDirectory(targetFullPath)

  console.log('==========================================')
  console.log('🎉 完成！')
  console.log(`👉 输出文件: ${outputFilePath}`)
}

main()
