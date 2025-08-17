import { randomUUID } from 'node:crypto'
import { StreamableHTTPTransport } from '@hono/mcp'
import consola from 'consola'
import { setupMcpServer } from '../services/mcp/setup.js'
import { createTrantorMiddleware } from '../utils/setup.js'

// 服务器启动时间戳，用于检测服务器重启
const SERVER_START_TIME = Date.now().toString()

// 全局 MCP 服务器实例（简化版本）
let globalMcpServer: {
  server: any
  transport: StreamableHTTPTransport
  initialized: boolean
} | null = null

function initializeGlobalMcpServer() {
  if (globalMcpServer) {
    return globalMcpServer
  }

  consola.info(`[Trantor MCP Server] 初始化全局 MCP 服务器...`)
  const server = setupMcpServer()
  const transport = new StreamableHTTPTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessionclosed: (sessionId) => {
      consola.info(`[Trantor MCP Server] MCP 会话已关闭: ${sessionId}`)
    },
  })

  globalMcpServer = {
    server,
    transport,
    initialized: false,
  }

  return globalMcpServer
}

export const mcpMiddleware = createTrantorMiddleware(async (c, next) => {
  const serverContext = initializeGlobalMcpServer()

  // 按需初始化连接
  if (!serverContext.initialized) {
    try {
      consola.info(`[Trantor MCP Server] 正在连接服务器到传输层...`)
      await serverContext.server.connect(serverContext.transport)
      serverContext.initialized = true
      consola.success(`[Trantor MCP Server] 服务器初始化成功`)
    }
    catch (error) {
      consola.error(`[Trantor MCP Server] 服务器初始化失败:`, error)
      // 重置全局状态，下次重试
      globalMcpServer = null
      throw error
    }
  }

  const sessionId = c.req.header('mcp-session-id') || randomUUID()

  c.set('mcpServer', serverContext)
  // 在响应头中返回会话 ID 和服务器启动时间戳
  c.header('mcp-session-id', sessionId)
  c.header('mcp-server-start-time', SERVER_START_TIME)
  await next()
})
