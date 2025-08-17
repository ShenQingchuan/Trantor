import type { PocketBaseArticle } from '../../bridge/types/articles'
import PocketBase from 'pocketbase'

export class PocketBaseService {
  private pb: PocketBase

  constructor(url = 'https://pocket.dokduk.cc') {
    this.pb = new PocketBase(url)
  }

  /**
   * 根据文件名获取文章记录
   */
  async getArticleByFileName(fileName: string): Promise<PocketBaseArticle | null> {
    try {
      const record = await this.pb.collection('trantor_blog_articles').getFirstListItem<PocketBaseArticle>(
        `fileName="${fileName}"`,
      )
      return record
    }
    catch (error: any) {
      if (error.status === 404) {
        return null
      }
      throw error
    }
  }

  /**
   * 创建新的文章记录
   */
  async createArticle(data: Omit<PocketBaseArticle, 'id' | 'created' | 'updated'>): Promise<PocketBaseArticle> {
    return await this.pb.collection('trantor_blog_articles').create<PocketBaseArticle>(data)
  }

  /**
   * 更新文章记录
   */
  async updateArticle(id: string, data: Partial<Omit<PocketBaseArticle, 'id' | 'created' | 'updated'>>): Promise<PocketBaseArticle> {
    return await this.pb.collection('trantor_blog_articles').update<PocketBaseArticle>(id, data)
  }

  /**
   * 获取所有文章记录
   */
  async getAllArticles(): Promise<PocketBaseArticle[]> {
    const result = await this.pb.collection('trantor_blog_articles').getFullList<PocketBaseArticle>({
      sort: '-created',
    })
    return result
  }

  /**
   * 删除文章记录
   */
  async deleteArticle(id: string): Promise<boolean> {
    return await this.pb.collection('trantor_blog_articles').delete(id)
  }
}

// 单例实例
export const pocketBaseService = new PocketBaseService()
