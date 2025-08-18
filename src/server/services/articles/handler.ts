import type { ArticleMetadata, CachedArticleResponse } from '../../../bridge/types/articles.js'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import frontMatter from 'front-matter'
import { CONTENT_DIR } from '../../constants/index.js'
import { errorResponse, successResponse } from '../../utils/response.js'
import { handlerFactory } from '../handler-factory.js'
import { articleCacheService } from './cache-service.js'

export const getArticleListHandler = handlerFactory.createHandlers(async (c) => {
  try {
    // 文章列表应该始终直接反映文件系统的状态，而不是依赖缓存
    const articleFileNames = await readdir(CONTENT_DIR)
    const articles = await Promise.all(
      articleFileNames
        .filter(fileName => fileName.endsWith('.md')) // 确保只处理 markdown 文件
        .map(async (fileName) => {
          const fileContent = await readFile(join(CONTENT_DIR, fileName), 'utf-8')
          const { attributes } = frontMatter<ArticleMetadata>(fileContent)
          const path = fileName.replace(/\.md$/, '')

          return {
            ...attributes,
            path,
          }
        }),
    )

    return successResponse(c, articles)
  }
  catch (error) {
    console.error('[Filesystem Error] Failed to read articles from filesystem for list:', error)
    return errorResponse(c, 500, 'Failed to retrieve article list')
  }
})

export const getArticleHandler = handlerFactory.createHandlers(async (c) => {
  const path = c.req.param('path')
  const theme = c.req.query('theme')
  if (!path) {
    return errorResponse(c, 404, 'Article not found')
  }

  try {
    const markdownIt = c.get('markdownIt')
    const result: CachedArticleResponse = await articleCacheService.getArticle(path, markdownIt, theme)

    return successResponse(c, {
      metadata: result.metadata,
      content: result.content,
      fromCache: result.fromCache,
      cacheUpdated: result.cacheUpdated,
    })
  }
  catch (error) {
    // 增加错误日志，暴露缓存服务失败的根本原因
    console.error(`[ArticleCacheService Error] Failed to get article for path "${path}":`, error)
    // 如果缓存服务失败，回退到原始逻辑
    try {
      const markdownIt = c.get('markdownIt')
      const fileContent = await readFile(join(CONTENT_DIR, `${path}.md`), 'utf-8')
      const { attributes, body } = frontMatter<ArticleMetadata>(fileContent)
      const content = markdownIt.render(body, {
        env: theme || 'dark',
      })

      // 启动“自我修复”：异步、在后台用新鲜数据更新缓存，不阻塞当前请求
      articleCacheService.renderAndCacheArticle(path, markdownIt, theme).catch((cacheError) => {
        console.error(`[Cache Self-healing Error] Failed to update cache for path "${path}" in background:`, cacheError)
      })

      return successResponse(c, {
        metadata: attributes,
        content,
        fromCache: false,
      })
    }
    catch (fsError) {
      console.error(`[Filesystem Fallback Error] Failed to read article for path "${path}":`, fsError)
      return errorResponse(c, 404, 'Article not found')
    }
  }
})
