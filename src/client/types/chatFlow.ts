import type { Client } from '@modelcontextprotocol/sdk/client/index.js'
import type { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import type { ChatCompletionFunctionTool, ChatCompletionMessageParam } from 'openai/resources/index.mjs'

export type ChatFlowMessageFilter = Array<
  | 'onlyPending'
  | 'onlyCompleted'
  | 'onlyTool'
>

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

export interface ChatFlowContext {
  mcpClient: Client
  mcpServerConnected: boolean
  transport: StreamableHTTPClientTransport | null

  messages: ChatCompletionMessageParam[]
  tools: ChatCompletionFunctionTool[]
}

export interface OpenAIToolCallData {
  type: 'function'
  id: string
  function: {
    name: string
    arguments: string
  }
}

export interface ChatStreamClientHooks {
  onToolCall?: (toolCall: {
    toolId: string
    toolName: string
    toolArgs: Record<string, unknown>
  }) => void | Promise<void>

  onToolResult?: (resp: {
    toolId: string
    toolName: string
    result: any
    isError?: boolean
  }) => void | Promise<void>
}

export interface StreamContext {
  toolCalls: OpenAIToolCallData[]
  hooks?: ChatStreamClientHooks
}
