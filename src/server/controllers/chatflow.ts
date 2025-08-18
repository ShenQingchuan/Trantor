import type { ChatDisplayMessage } from '../../bridge/types/chatFlow'
import type { ServerContext } from '../types'
import { env } from 'node:process'
import consola from 'consola'
import { Hono } from 'hono'
import { pocketBaseService } from '../services/pocketbase.js'
import { errorResponse, successResponse } from '../utils/response.js'

/**
 * 使用AI生成对话总结标题
 */
async function generateConversationSummary(conversationText: string, llmClient: any): Promise<string> {
  try {
    const prompt = `请为以下对话生成一个简洁的标题（不超过15个字符），只返回标题文本，不要包含引号或其他符号：

${conversationText}`

    const response = await llmClient.chat.completions.create({
      model: env.LLM_MODEL_NAME || 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })

    const title = response.choices[0]?.message?.content?.trim()
    if (!title) {
      throw new Error('生成内容为空')
    }

    // 限制标题长度
    return title.length > 15 ? `${title.substring(0, 12)}...` : title
  }
  catch (error) {
    consola.error('AI生成对话总结失败:', error)
    throw new Error(`LLM调用失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

const chatFlowRouter = new Hono<ServerContext>()

/**
 * 获取会话列表
 */
chatFlowRouter.get('/sessions', async (c) => {
  try {
    const sessions = await pocketBaseService.getChatSessions()
    return successResponse(c, sessions)
  }
  catch (error) {
    consola.error('获取会话列表失败:', error)
    return errorResponse(c, 500, '获取会话列表失败')
  }
})

/**
 * 创建新会话
 */
chatFlowRouter.post('/sessions', async (c) => {
  try {
    const body = await c.req.json()
    const { title } = body

    const sessionData = {
      title: title || '新对话',
      last_message_at: new Date().toISOString(),
      message_count: 0,
      archived: false,
    }

    const session = await pocketBaseService.createChatSession(sessionData)
    return successResponse(c, session)
  }
  catch (error) {
    consola.error('创建会话失败:', error)
    return errorResponse(c, 500, '创建会话失败')
  }
})

/**
 * 获取会话详情
 */
chatFlowRouter.get('/sessions/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId')
    const session = await pocketBaseService.getChatSession(sessionId)

    if (!session) {
      return errorResponse(c, 404, '会话不存在')
    }

    return successResponse(c, session)
  }
  catch (error) {
    consola.error('获取会话详情失败:', error)
    return errorResponse(c, 500, '获取会话详情失败')
  }
})

/**
 * 更新会话信息
 */
chatFlowRouter.put('/sessions/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId')
    const body = await c.req.json()

    const session = await pocketBaseService.updateChatSession(sessionId, body)
    return successResponse(c, session)
  }
  catch (error) {
    consola.error('更新会话失败:', error)
    return errorResponse(c, 500, '更新会话失败')
  }
})

/**
 * 删除会话
 */
chatFlowRouter.delete('/sessions/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId')
    await pocketBaseService.deleteChatSession(sessionId)
    return successResponse(c, { success: true })
  }
  catch (error) {
    consola.error('删除会话失败:', error)
    return errorResponse(c, 500, '删除会话失败')
  }
})

/**
 * 获取会话的消息列表
 */
chatFlowRouter.get('/sessions/:sessionId/messages', async (c) => {
  try {
    const sessionId = c.req.param('sessionId')
    const messages = await pocketBaseService.getChatMessages(sessionId)
    return successResponse(c, messages)
  }
  catch (error) {
    consola.error('获取消息列表失败:', error)
    return errorResponse(c, 500, '获取消息列表失败')
  }
})

/**
 * 保存消息到会话
 */
chatFlowRouter.post('/sessions/:sessionId/messages', async (c) => {
  try {
    const sessionId = c.req.param('sessionId')
    const body = await c.req.json()

    const messageData = {
      session_id: sessionId,
      ...body,
    }

    const message = await pocketBaseService.saveChatMessage(messageData)
    return successResponse(c, message)
  }
  catch (error) {
    consola.error('保存消息失败:', error)
    return errorResponse(c, 500, '保存消息失败')
  }
})

/**
 * 批量保存会话消息
 */
chatFlowRouter.post('/sessions/:sessionId/messages/batch', async (c) => {
  try {
    const sessionId = c.req.param('sessionId')
    const body = await c.req.json()
    const { messages }: { messages: ChatDisplayMessage[] } = body

    await pocketBaseService.saveChatMessages(sessionId, messages)
    return successResponse(c, { success: true })
  }
  catch (error) {
    consola.error('批量保存消息失败:', error)
    return errorResponse(c, 500, '批量保存消息失败')
  }
})

/**
 * 生成会话标题总结
 */
chatFlowRouter.post('/sessions/:sessionId/summarize', async (c) => {
  try {
    const sessionId = c.req.param('sessionId')

    // 获取会话的消息列表
    const messages = await pocketBaseService.getChatMessages(sessionId)

    // 如果消息数量少于4条，返回固定标题
    if (messages.length < 4) {
      return successResponse(c, { title: '新对话' })
    }

    // 构建用于总结的对话内容
    const conversationText = messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n')

    // 获取LLM客户端并调用AI服务生成总结
    const llmClient = c.get('llmClient')
    if (!llmClient) {
      return errorResponse(c, 500, 'LLM服务未配置')
    }

    const summary = await generateConversationSummary(conversationText, llmClient)
    return successResponse(c, { title: summary })
  }
  catch (error) {
    consola.error('生成会话标题失败:', error)
    return errorResponse(c, 500, '生成会话标题失败')
  }
})

export { chatFlowRouter }
