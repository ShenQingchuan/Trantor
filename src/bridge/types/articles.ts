export interface ArticleMetadata {
  path: string
  title: string
  date: string
  category: string
  tags: string[]
}

export interface ArticleResponse {
  content: string
  metadata: ArticleMetadata | null
}

// PocketBase 文章记录类型
export interface PocketBaseArticle {
  id: string
  created: string
  updated: string
  fileName: string
  fileHash: string
  fileMtime: number
  renderedHTML: string
  metadata: string
}

// 文章服务响应类型
export interface CachedArticleResponse extends ArticleResponse {
  fromCache: boolean
  cacheUpdated?: boolean
}
