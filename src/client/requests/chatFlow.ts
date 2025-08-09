import type {
  ChatCompletionChunk,
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/index.mjs'
import { Stream } from 'openai/core/streaming.mjs'

export async function fetchChatStream(
  messages: ChatCompletionMessageParam[],
  tools: ChatCompletionTool[],
): Promise<Stream<ChatCompletionChunk>> {
  const abortController = new AbortController()
  const response = await fetch('/api/llm/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      tools,
    }),
    signal: abortController.signal,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return Stream.fromSSEResponse<ChatCompletionChunk>(response, abortController)
}
