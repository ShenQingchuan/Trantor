import type { ArticleMetadata } from '../../../bridge/types/articles.js'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import frontMatter from 'front-matter'
import { CONTENT_DIR } from '../../constants/index.js'
import { errorResponse, successResponse } from '../../utils/response.js'
import { handlerFactory } from '../handler-factory.js'

export const getArticleListHandler = handlerFactory.createHandlers(async (c) => {
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

  const markdownIt = c.get('markdownIt')
  const fileContent = await readFile(join(CONTENT_DIR, `${path}.md`), 'utf-8')
  const { attributes, body } = frontMatter<ArticleMetadata>(fileContent)
  const html = markdownIt.render(body, {
    env: theme || 'dark',
  })

  return c.json(
    successResponse({
      metadata: attributes,
      content: html,
    }),
  )
})
