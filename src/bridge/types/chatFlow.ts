import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/index.mjs'

export interface ChatRequestBody {
  messages: ChatCompletionMessageParam[]
  tools: ChatCompletionTool[]
}

export type ChatDisplayMessage = ({
  id: string
  streaming?: boolean
}) & (
  | { role: 'user', content: string }
  | { role: 'assistant', content: string }
  | {
    role: 'tool'
    content: string
    args: Record<string, unknown>
    result?: string
    pending?: boolean
    isError?: boolean
  }
)

export interface ChatFlowMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant' | 'tool'
  content: string
  tool_name?: string
  tool_args?: Record<string, unknown>
  tool_result?: any
  tool_has_error?: boolean
  created: string
}

export interface ChatFlowSession {
  id: string
  title: string
  created: string
  updated: string
  user_id?: string
  last_message_at: string
  message_count: number
  archived: boolean
  is_title_auto_generated?: boolean // 标记标题是否已经自动生成过
}
