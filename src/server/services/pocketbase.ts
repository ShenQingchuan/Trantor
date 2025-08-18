import type { PocketBaseArticle } from '../../bridge/types/articles'
import type { ChatDisplayMessage, ChatFlowMessage, ChatFlowSession } from '../../bridge/types/chatFlow'
import PocketBase from 'pocketbase'

export class PocketBaseService {
  private pb: PocketBase

  constructor(url = 'https://pocket.dokduk.cc') {
    this.pb = new PocketBase(url)
    // 设置请求超时
    this.pb.beforeSend = function (url, options) {
      options.timeout = 10000 // 10秒超时
      return { url, options }
    }
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

  // ChatFlow 会话管理方法

  /**
   * 创建新的会话
   */
  async createChatSession(data: Omit<ChatFlowSession, 'id' | 'created' | 'updated'>): Promise<ChatFlowSession> {
    return await this.pb.collection('trantor_chatflow_history').create<ChatFlowSession>(data)
  }

  /**
   * 获取所有会话列表
   */
  async getChatSessions(userId?: string): Promise<ChatFlowSession[]> {
    const startTime = Date.now()
    try {
      const filter = userId ? `user_id="${userId}"` : ''

      // 性能优化：使用分页和字段限制
      const result = await this.pb.collection('trantor_chatflow_history').getList<ChatFlowSession>(1, 50, {
        sort: '-last_message_at',
        filter,
      })

      const duration = Date.now() - startTime
      console.log(`getChatSessions 执行时间: ${duration}ms, 返回 ${result.items.length} 个会话, 总数: ${result.totalItems}`)

      return result.items
    }
    catch (error) {
      const duration = Date.now() - startTime
      console.error(`getChatSessions 执行失败，耗时: ${duration}ms`, error)
      throw error
    }
  }

  /**
   * 获取单个会话详情
   */
  async getChatSession(sessionId: string): Promise<ChatFlowSession | null> {
    try {
      const record = await this.pb.collection('trantor_chatflow_history').getOne<ChatFlowSession>(sessionId)
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
   * 更新会话信息
   */
  async updateChatSession(sessionId: string, data: Partial<Omit<ChatFlowSession, 'id' | 'created' | 'updated'>>): Promise<ChatFlowSession> {
    return await this.pb.collection('trantor_chatflow_history').update<ChatFlowSession>(sessionId, data)
  }

  /**
   * 删除会话（包括所有消息）
   */
  async deleteChatSession(sessionId: string): Promise<boolean> {
    // 先删除所有消息
    await this.pb.collection('trantor_chatflow_messages').getFullList({
      filter: `session_id="${sessionId}"`,
    }).then((messages) => {
      return Promise.all(messages.map(msg => this.pb.collection('trantor_chatflow_messages').delete(msg.id)))
    })

    // 再删除会话
    return await this.pb.collection('trantor_chatflow_history').delete(sessionId)
  }

  /**
   * 保存消息到会话
   */
  async saveChatMessage(data: Omit<ChatFlowMessage, 'id' | 'created'>): Promise<ChatFlowMessage> {
    const message = await this.pb.collection('trantor_chatflow_messages').create<ChatFlowMessage>(data, {
      requestKey: `save_single_message_${data.session_id}`, // 为单条消息保存设置唯一key
    })

    // 更新会话的最后消息时间和消息数量
    const session = await this.getChatSession(data.session_id)
    if (session) {
      await this.pb.collection('trantor_chatflow_history').update<ChatFlowSession>(data.session_id, {
        last_message_at: new Date().toISOString(),
        message_count: (session.message_count || 0) + 1,
      }, {
        requestKey: `update_session_single_${data.session_id}`, // 为会话更新设置唯一key
      })
    }

    return message
  }

  /**
   * 获取会话的所有消息
   */
  async getChatMessages(sessionId: string): Promise<ChatFlowMessage[]> {
    try {
      const result = await this.pb.collection('trantor_chatflow_messages').getFullList<ChatFlowMessage>({
        filter: `session_id="${sessionId}"`,
        sort: 'created', // 改为按创建时间排序
      })
      return result
    }
    catch (error) {
      console.error('getChatMessages 错误:', error)
      throw error
    }
  }

  /**
   * 批量保存消息（用于保存整个对话历史）
   */
  async saveChatMessages(sessionId: string, messages: ChatDisplayMessage[]): Promise<void> {
    try {
      // 先获取已保存的消息数量
      const existingMessages = await this.getChatMessages(sessionId)
      const existingCount = existingMessages.length

      // 只保存新增的消息
      const newMessages = messages.slice(existingCount)

      if (newMessages.length === 0) {
        return // 没有新消息需要保存
      }

      const chatMessages: Omit<ChatFlowMessage, 'id' | 'created'>[] = newMessages.map(msg => ({
        session_id: sessionId,
        role: msg.role,
        content: msg.content || '',
        tool_name: msg.role === 'tool' ? (msg as any).tool_name : undefined,
        tool_args: msg.role === 'tool' ? (msg as any).args : undefined,
        tool_result: msg.role === 'tool' ? (msg as any).result : undefined,
        tool_has_error: msg.role === 'tool' ? (msg as any).isError : undefined,
      }))

      // 批量保存新消息，使用唯一的requestKey
      for (const message of chatMessages) {
        await this.pb.collection('trantor_chatflow_messages').create(message, {
          requestKey: `save_message_${sessionId}`, // 为批量消息保存设置唯一key
        })
      }

      // 更新会话信息，使用唯一的requestKey
      await this.pb.collection('trantor_chatflow_history').update(sessionId, {
        last_message_at: new Date().toISOString(),
        message_count: messages.length, // 总消息数量
      }, {
        requestKey: `update_session_${sessionId}`, // 为会话更新设置唯一key
      })
    }
    catch (error) {
      console.error('PocketBase saveChatMessages 错误:', error)
      throw error
    }
  }
}

// 单例实例
export const pocketBaseService = new PocketBaseService()
