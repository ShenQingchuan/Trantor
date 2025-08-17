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
    const { chatMcpSessionId, chatMcpServerStartTime, chatMcpTools } = storeToRefs(useChatFlowStore())

    await retryAsync(
      async () => {
        if (!ctx.value)
          throw new Error('MCP 环境上下文未初始化')
        if (!ctx.value.mcpClient)
          throw new Error('MCP 客户端未初始化')

        // 清理任何现有的连接状态（确保从干净状态开始）
        if (ctx.value.transport) {
          try {
            ctx.value.transport = null
            ctx.value.mcpServerConnected = false
          }
          catch (error) {
            // 忽略清理错误
          }
        }

        // 检查服务器重启状态，如果是第一次连接或需要检测重启，先发起一个探测请求
        let shouldClearSession = false
        if (chatMcpSessionId.value && chatMcpServerStartTime.value) {
          try {
            const statusResponse = await fetch(`${window.location.origin}/api/mcp/status?sessionId=${encodeURIComponent(chatMcpSessionId.value)}`)
            if (statusResponse.ok) {
              const statusData = await statusResponse.json()
              
              if (statusData.serverStartTime && statusData.serverStartTime !== chatMcpServerStartTime.value) {
                console.warn('🔄 检测到服务器重启，清理客户端状态')
                shouldClearSession = true
                chatMcpSessionId.value = null
                chatMcpTools.value = null
                chatMcpServerStartTime.value = statusData.serverStartTime
              } else {
                console.log('✅ 服务器状态正常，会话有效')
              }
            }
          }
          catch (error) {
            console.warn('无法进行服务器重启检测，继续使用缓存会话:', error)
          }
        }

        // 建立新连接
        const transport = new StreamableHTTPClientTransport(
          new URL(`${window.location.origin}/api/mcp`),
          {
            // 如果检测到服务器重启或没有缓存会话，则不传 sessionId
            sessionId: shouldClearSession ? undefined : (chatMcpSessionId.value || undefined),
            fetch: async (url, options) => {
              const response = await fetch(url, options)
                
                if (!response.ok) {
                  throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                }
                
                const newSessionId = response.headers.get('mcp-session-id')
                const newServerStartTime = response.headers.get('mcp-server-start-time')
                
                // 更新存储的值
                if (newSessionId) {
                  chatMcpSessionId.value = newSessionId
                }
                if (newServerStartTime) {
                  chatMcpServerStartTime.value = newServerStartTime
                }
                
                return response
            },
          },
        )

        console.log('🔌 开始连接 MCP 客户端...')
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
        console.log('🔧 已载入 MCP 工具列表:', fetchedTools.length, '个工具')
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
