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
