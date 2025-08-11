import type { StreamableHTTPTransport } from '@hono/mcp'
import type { HttpBindings } from '@hono/node-server'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { Context, Hono } from 'hono'
import type MarkdownIt from 'markdown-it'
import type OpenAI from 'openai'
import type { AuthenticatedUser } from '../../bridge/types/auth.js'

export interface ServerContext extends Context {
  Variables: {
    llmClient: OpenAI
    mcpServer: {
      server: McpServer
      transport: StreamableHTTPTransport
      initialized: boolean
      connectTransport: () => Promise<void>
    }
    markdownIt: MarkdownIt
    currentUser?: AuthenticatedUser
    authToken?: string
  }
  Bindings: HttpBindings
}

export type TrantorHono = Hono<ServerContext>

export interface PageResponse<E = any> {
  code: number
  data: {
    page: {
      page: string
      total_count: number
      page_size: string
    }
    list: E[]
  }
  message: string
}
