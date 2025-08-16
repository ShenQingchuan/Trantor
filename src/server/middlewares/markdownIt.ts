import Shiki from '@shikijs/markdown-it'
import markdownit from 'markdown-it'
import { createTrantorMiddleware } from '../utils/setup.js'

// 将 Shiki 初始化移到模块级别，避免每次请求都重新初始化
let md: markdownit | null = null

// 异步初始化 markdown-it 和 Shiki
async function initializeMarkdownIt() {
  if (md)
    return md

  md = markdownit()
  md.use(await Shiki({
    themes: {
      light: 'vitesse-light',
      dark: 'tokyo-night',
    },
    // 添加性能优化选项
    langs: [
      'javascript',
      'typescript',
      'json',
      'bash',
      'shell',
      'markdown',
      'html',
      'css',
      'scss',
      'c',
      'python',
    ],
  }))

  return md
}

export const markdownItMiddleware = createTrantorMiddleware(async (c, next) => {
  // 确保 markdown-it 已初始化
  const markdownIt = await initializeMarkdownIt()

  c.set('markdownIt', markdownIt)
  await next()
})
