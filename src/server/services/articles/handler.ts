import type { ArticleMetadata } from '../../../bridge/types/articles.js'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import frontMatter from 'front-matter'
import { CONTENT_DIR } from '../../constants/index.js'
import { errorResponse, successResponse } from '../../utils/response.js'
import { handlerFactory } from '../handler-factory.js'

export const getArticleListHandler = handlerFactory.createHandlers(async (c) => {
  const { fileListCache } = c.get('markdownIt')

  if (fileListCache.size === 0) {
    const articleFileNames = await readdir(CONTENT_DIR)
    const articles = await Promise.all(
      articleFileNames.map(async (fileName) => {
        const fileContent = await readFile(join(CONTENT_DIR, fileName), 'utf-8')
        const { attributes } = frontMatter<ArticleMetadata>(fileContent)
        const path = fileName.replace(/\.md$/, '')

        return {
          ...attributes,
          path,
        }
      }),
    )
    for (const article of articles) {
      fileListCache.set(article.path, article)
    }
  }

  const articles = Array.from(fileListCache.values())

  return c.json(
    successResponse({
      articles,
    }),
  )
})

export const getArticleHandler = handlerFactory.createHandlers(async (c) => {
  const path = c.req.param('path')
  const theme = c.req.query('theme')
  if (!path) {
    return c.json(errorResponse(404, 'Article not found'))
  }

  const { md, contentCache } = c.get('markdownIt')
  let articleCache = contentCache.get(path)
  if (!articleCache) {
    const fileContent = await readFile(join(CONTENT_DIR, `${path}.md`), 'utf-8')
    const { attributes, body } = frontMatter<ArticleMetadata>(fileContent)
    const html = md.render(body, {
      env: theme || 'dark',
    })
    articleCache = {
      content: html,
      metadata: attributes,
    }
    contentCache.set(path, articleCache)
  }

  return c.json(
    successResponse({
      metadata: articleCache.metadata,
      content: articleCache.content,
    }),
  )
})
