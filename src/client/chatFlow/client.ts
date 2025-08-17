import type { ChatCompletionFunctionTool, ChatCompletionMessageParam } from 'openai/resources/index.mjs'
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
    const { chatMcpSessionId, chatMcpTools } = storeToRefs(useChatFlowStore())

    await retryAsync(
      async () => {
        if (!ctx.value)
          throw new Error('MCP 环境上下文未初始化')
        if (!ctx.value.mcpClient)
          throw new Error('MCP 客户端未初始化')

        // 检查现有连接状态
        if (ctx.value.transport && ctx.value.mcpServerConnected) {
          try {
            // 测试连接是否仍然有效
            await ctx.value.mcpClient.listTools()
            console.log('✅ 复用已连接的 MCP 串口')
            return
          }
          catch (error) {
            // 连接已失效，清理状态
            console.warn('🔄 检测到连接失效，重新建立连接')
            ctx.value.transport = null
            ctx.value.mcpServerConnected = false
            chatMcpSessionId.value = null
          }
        }

        // 建立新连接
        const transport = new StreamableHTTPClientTransport(
          new URL(`${window.location.origin}/api/mcp`),
          {
            sessionId: chatMcpSessionId.value || undefined,
            fetch: (url, options) => {
              return fetch(url, options).then((response) => {
                if (!response.ok) {
                  throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                }
                const newSessionId = response.headers.get('mcp-session-id')
                if (newSessionId) {
                  chatMcpSessionId.value = newSessionId
                }
                return response
              })
            },
          },
        )

        await ctx.value.mcpClient.connect(transport)
        ctx.value.transport = transport
        ctx.value.mcpServerConnected = true
        console.log('✅ 连接 Trantor MCP 串口成功！')

        // 获取工具列表
        const toolListResp = await ctx.value.mcpClient.listTools()
        const fetchedTools = toolListResp.tools.map((tool): ChatCompletionFunctionTool => {
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
