import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/index.mjs'
import type { ChatFlowContext } from '../types/chatFlow'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { retryAsync } from 'ts-retry'
import { useChatFlowStore } from '../stores/chatFlowStore'
import { systemPrompts } from './prompts'

export const FIMOOX_MCP_SERVER_NAME = 'trantor-mcp-server'

export async function createChatFlowContext(): Promise<ChatFlowContext> {
  const mcpClient = new Client({
    name: 'trantor-mcp-client',
    version: '1.0.0',
  })

  const messages = [
    ...systemPrompts.map((prompt): ChatCompletionMessageParam => ({
      role: 'system',
      content: prompt,
    })),
  ]

  return {
    messages,
    mcpClient,
    mcpServerConnected: false,
    transport: null,
    tools: [],
  }
}

export async function connectTrantorMcpServer() {
  try {
    const { chatFlowAIContext: ctx } = storeToRefs(useChatFlowStore())

    await retryAsync(
      async () => {
        if (!ctx.value)
          throw new Error('MCP 环境上下文未初始化')
        if (!ctx.value.mcpClient)
          throw new Error('MCP 客户端未初始化')

        const { chatMcpSessionId, chatMcpTools } = storeToRefs(useChatFlowStore())
        if (ctx.value.transport) {
          // 如果已经连接过，则复用串口
          console.log('✅ 复用已连接过的 MCP 串口')
          return
        }

        const transport = new StreamableHTTPClientTransport(
          new URL(`${window.location.origin}/api/mcp`),
          {
            sessionId: chatMcpSessionId.value || undefined,
            fetch: (url, options) => {
            // 在请求成功返回后将 headers 中的 'mcp-session-id' 设置到 chatMcpSessionId 中
              return fetch(url, options).then((response) => {
                chatMcpSessionId.value = response.headers.get('mcp-session-id')
                return response
              })
            },
          },
        )
        await ctx.value.mcpClient.connect(transport)
        ctx.value.transport = transport
        console.log('✅ 连接 Trantor MCP 串口成功！')

        // 必须用 listTools 来获取工具列表，同时触发 MCP 服务器初始化
        const toolListResp = await ctx.value.mcpClient.listTools()
        const fetchedTools = toolListResp.tools.map((tool): ChatCompletionTool => {
          return {
            type: 'function',
            function: {
              name: tool.name,
              description: tool.description,
              parameters: tool.inputSchema,
            },
          }
        })
        chatMcpTools.value = fetchedTools
        ctx.value.tools = fetchedTools
        console.log('🔧 已载入 MCP 工具列表')
      },
      {
        delay: 100,
        maxTry: 5,
      },
    )
  }
  catch (error) {
    const errorMsg = `❌ 连接 Trantor MCP 服务器失败！${error}`
    console.error(errorMsg, error)
    throw error
  }
}
