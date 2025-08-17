import type MarkdownIt from 'markdown-it'
import type { ArticleMetadata, CachedArticleResponse, PocketBaseArticle } from '../../../bridge/types/articles'
import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import frontMatter from 'front-matter'
import { CONTENT_DIR } from '../../constants/index.js'
import { pocketBaseService } from '../pocketbase.js'

// 获取错误信息的辅助函数
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

interface EnhancedArticleCacheStatus {
  fileName: string
  currentHash: string
  cached: boolean
  needsUpdate: boolean
  cachedArticle: PocketBaseArticle | null
}

export class ArticleCacheService {
  /**
   * 计算文件的 SHA256 哈希值
   */
  private async calculateFileHash(content: string): Promise<string> {
    return createHash('sha256').update(content, 'utf8').digest('hex')
  }

  /**
   * 检查文件的缓存状态
   */
  async checkCacheStatus(
    fileName: string,
    // 优化：允许传入已获取的文章对象，避免重复查询
    cachedArticle?: PocketBaseArticle | null,
  ): Promise<EnhancedArticleCacheStatus> {
    const filePath = join(CONTENT_DIR, `${fileName}.md`)

    try {
      const fileContent = await readFile(filePath, 'utf-8')
      const currentHash = await this.calculateFileHash(fileContent)

      // 如果未传入文章对象，则从数据库查询
      const articleToCompare = cachedArticle === undefined
        ? await pocketBaseService.getArticleByFileName(fileName)
        : cachedArticle

      if (!articleToCompare) {
        return {
          fileName,
          currentHash,
          cached: false,
          needsUpdate: true,
          cachedArticle: null,
        }
      }

      // 比较文件内容的 hash，如果不同则需要更新
      const needsUpdate = articleToCompare.fileHash !== currentHash

      return {
        fileName,
        currentHash,
        cached: true,
        needsUpdate,
        cachedArticle: articleToCompare,
      }
    }
    catch (error) {
      throw new Error(`检查文件缓存状态失败: ${
        error instanceof Error
          ? error.message
          : String(error)
      }`)
    }
  }

  /**
   * 渲染并缓存文章
   */
  async renderAndCacheArticle(
    fileName: string,
    markdownIt: MarkdownIt,
    theme?: string,
  ): Promise<{ content: string, metadata: ArticleMetadata }> {
    const filePath = join(CONTENT_DIR, `${fileName}.md`)
    const fileContent = await readFile(filePath, 'utf-8')
    const { attributes, body } = frontMatter<ArticleMetadata>(fileContent)

    // 渲染 HTML
    const html = markdownIt.render(body, {
      env: theme || 'dark',
    })

    const fileStats = await stat(filePath)
    const fileHash = await this.calculateFileHash(fileContent)
    const fileMtime = Math.floor(fileStats.mtime.getTime() / 1000)

    // 检查是否已存在缓存记录
    const existingArticle = await pocketBaseService.getArticleByFileName(fileName)

    const articleData = {
      fileName,
      fileHash,
      fileMtime,
      renderedHTML: html,
      // 写入数据库前，将 metadata 对象序列化为 JSON 字符串
      metadata: JSON.stringify({
        ...attributes,
        path: fileName,
      }),
    }

    if (existingArticle) {
      // 更新现有记录
      await pocketBaseService.updateArticle(existingArticle.id, articleData)
    }
    else {
      // 创建新记录
      await pocketBaseService.createArticle(articleData)
    }

    return {
      content: html,
      metadata: {
        ...attributes,
        path: fileName,
      },
    }
  }

  /**
   * 获取文章内容（带缓存优化）
   */
  async getArticle(
    fileName: string,
    markdownIt: MarkdownIt,
    theme?: string,
  ): Promise<CachedArticleResponse> {
    try {
      const cacheStatus = await this.checkCacheStatus(fileName)

      if (cacheStatus.cached && !cacheStatus.needsUpdate && cacheStatus.cachedArticle) {
        // 缓存有效，直接返回
        const { renderedHTML, metadata: rawMetadata } = cacheStatus.cachedArticle

        // 诊断日志：打印出将要被解析的原始字符串
        console.log('[Cache Service Debug] Attempting to parse metadata string:', rawMetadata)

        return {
          content: renderedHTML,
          metadata: JSON.parse(rawMetadata),
          fromCache: true,
          cacheUpdated: false,
        }
      }

      // 缓存无效或不存在，需要重新渲染和缓存
      const { content, metadata } = await this.renderAndCacheArticle(fileName, markdownIt, theme)

      return {
        content,
        metadata,
        fromCache: false,
        cacheUpdated: cacheStatus.cached, // 如果之前有缓存则表示更新了缓存
      }
    }
    catch (error) {
      throw new Error(`获取文章失败: ${getErrorMessage(error)}`)
    }
  }

  /**
   * 清理无效的缓存记录（文件已被删除）
   */
  async cleanupOrphanedCache(): Promise<void> {
    const cachedArticles = await pocketBaseService.getAllArticles()

    for (const article of cachedArticles) {
      try {
        // pocketbase 中的 fileName 字段已经不带 .md 后缀了
        await this.checkCacheStatus(article.fileName)
      }
      catch {
        // 文件不存在，删除缓存记录
        await pocketBaseService.deleteArticle(article.id)
      }
    }
  }
}

// 单例实例
export const articleCacheService = new ArticleCacheService()
