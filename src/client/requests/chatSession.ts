import type { ChatFlowMessage, ChatFlowSession } from '../../bridge/types/chatFlow'
import type { ChatDisplayMessage } from '../types/chatFlow'

// 会话 API 请求函数

/**
 * 获取所有会话列表
 */
export async function fetchChatSessions(): Promise<ChatFlowSession[]> {
  const response = await fetch('/api/chatflow/sessions')
  if (!response.ok) {
    throw new Error(`获取会话列表失败: ${response.status}`)
  }
  const { data } = await response.json()
  return data
}

/**
 * 创建新会话
 */
export async function createChatSession(title?: string): Promise<ChatFlowSession> {
  const response = await fetch('/api/chatflow/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  })
  if (!response.ok) {
    throw new Error(`创建会话失败: ${response.status}`)
  }
  const { data } = await response.json()
  return data
}

/**
 * 获取会话详情
 */
export async function fetchChatSession(sessionId: string): Promise<ChatFlowSession> {
  const response = await fetch(`/api/chatflow/sessions/${sessionId}`)
  if (!response.ok) {
    throw new Error(`获取会话详情失败: ${response.status}`)
  }
  const { data } = await response.json()
  return data
}

/**
 * 更新会话信息
 */
export async function updateChatSession(sessionId: string, updates: Partial<Omit<ChatFlowSession, 'id' | 'created' | 'updated'>>): Promise<ChatFlowSession> {
  const response = await fetch(`/api/chatflow/sessions/${sessionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  })
  if (!response.ok) {
    throw new Error(`更新会话失败: ${response.status}`)
  }
  const { data } = await response.json()
  return data
}

/**
 * 删除会话
 */
export async function deleteChatSession(sessionId: string): Promise<void> {
  const response = await fetch(`/api/chatflow/sessions/${sessionId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error(`删除会话失败: ${response.status}`)
  }
}

/**
 * 获取会话的消息列表
 */
export async function fetchChatMessages(sessionId: string): Promise<ChatFlowMessage[]> {
  const response = await fetch(`/api/chatflow/sessions/${sessionId}/messages`)
  if (!response.ok) {
    throw new Error(`获取消息列表失败: ${response.status}`)
  }
  const { data } = await response.json()
  return data
}

/**
 * 保存单条消息到会话
 */
export async function saveChatMessage(sessionId: string, message: Omit<ChatFlowMessage, 'id' | 'created' | 'session_id'>): Promise<ChatFlowMessage> {
  const response = await fetch(`/api/chatflow/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  })
  if (!response.ok) {
    throw new Error(`保存消息失败: ${response.status}`)
  }
  const { data } = await response.json()
  return data
}

/**
 * 批量保存会话消息
 */
export async function saveChatMessages(sessionId: string, messages: ChatDisplayMessage[]): Promise<void> {
  const response = await fetch(`/api/chatflow/sessions/${sessionId}/messages/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  })

  const result = await response.json()

  if (!response.ok || (result.code !== undefined && result.code !== 0)) {
    console.error('saveChatMessages API 错误:', result)
    throw new Error(`批量保存消息失败: ${result.message || response.status}`)
  }
}

/**
 * 生成会话标题总结
 */
export async function generateSessionTitle(sessionId: string): Promise<string> {
  const url = `/api/chatflow/sessions/${sessionId}/summarize`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('generateSessionTitle 错误响应:', errorText)
    throw new Error(`生成会话标题失败: ${response.status}`)
  }

  const result = await response.json()

  return result.data.title
}
