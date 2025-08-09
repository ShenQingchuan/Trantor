import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/index.mjs'

export interface ChatRequestBody {
  messages: ChatCompletionMessageParam[]
  tools: ChatCompletionTool[]
}
