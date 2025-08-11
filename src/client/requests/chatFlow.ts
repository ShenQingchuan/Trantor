import type {
  ChatCompletionChunk,
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/index.mjs'
import { Stream } from 'openai/core/streaming.mjs'
import { useAuthStore } from '../stores/authStore'

export async function fetchChatStream(
  messages: ChatCompletionMessageParam[],
  tools: ChatCompletionTool[],
): Promise<Stream<ChatCompletionChunk>> {
  const authStore = useAuthStore()

  // Check if user has permission to send chat messages
  if (!authStore.hasPermission('chat', 'chat.send')) {
    throw new Error('Permission denied: You do not have permission to send chat messages')
  }

  const abortController = new AbortController()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Add authentication token if available
  if (authStore.authToken) {
    headers.Authorization = `Bearer ${authStore.authToken}`
  }

  const response = await fetch('/api/llm/chat/completions', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      messages,
      tools,
    }),
    signal: abortController.signal,
  })

  if (!response.ok) {
    if (response.status === 401) {
      authStore.logout()
      throw new Error('Authentication required: Please log in to use chat')
    }
    else if (response.status === 403) {
      throw new Error('Permission denied: You do not have permission to use chat')
    }
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return Stream.fromSSEResponse<ChatCompletionChunk>(response, abortController)
}
