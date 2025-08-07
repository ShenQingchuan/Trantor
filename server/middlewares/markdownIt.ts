import type { ArticleMetadata, ArticleResponse } from '../../bridge/types/articles'
import Shiki from '@shikijs/markdown-it'
import { LRUCache } from 'lru-cache'
import markdownit from 'markdown-it'
import { createTrantorMiddleware } from '../utils/setup.js'

// 将 Shiki 初始化移到模块级别，避免每次请求都重新初始化
let md: markdownit | null = null

// 使用 LRU 缓存，限制内存使用
const fileListCache = new LRUCache<string, ArticleMetadata>({
  max: 50, // 最多缓存50篇文章的元数据
  ttl: 1000 * 60 * 60, // 1小时过期
})

const contentCache = new LRUCache<string, ArticleResponse>({
  max: 20, // 最多缓存20篇文章的完整内容
  ttl: 1000 * 60 * 30, // 30分钟过期
})

// 异步初始化 markdown-it 和 Shiki
async function initializeMarkdownIt() {
  if (md)
    return md

  md = markdownit()
  md.use(await Shiki({
    themes: {
      light: 'one-light',
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

  c.set('markdownIt', {
    md: markdownIt,
    fileListCache,
    contentCache,
  })
  await next()
})
