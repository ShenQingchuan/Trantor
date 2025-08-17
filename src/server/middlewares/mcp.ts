import { randomUUID } from 'node:crypto'
import { StreamableHTTPTransport } from '@hono/mcp'
import consola from 'consola'
import { setupMcpServer } from '../services/mcp/setup.js'
import { createTrantorMiddleware } from '../utils/setup.js'

// 会话级服务器实例缓存
const sessionServers = new Map<string, {
  server: any
  transport: StreamableHTTPTransport
  initialized: boolean
}>()

export const mcpMiddleware = createTrantorMiddleware(async (c, next) => {
  const sessionId = c.req.header('mcp-session-id') || randomUUID()
  
  let serverContext = sessionServers.get(sessionId)
  
  if (!serverContext) {
    // 为新会话创建独立的服务器实例
    const server = setupMcpServer()
    const transport = new StreamableHTTPTransport({
      sessionIdGenerator: () => sessionId,
      onsessionclosed: (closedSessionId) => {
        consola.log(`[Trantor MCP] MCP 会话已关闭: ${closedSessionId}`)
        sessionServers.delete(closedSessionId) // 清理会话
      },
    })
    
    serverContext = {
      server,
      transport,
      initialized: false
    }
    sessionServers.set(sessionId, serverContext)
    consola.log(`[Trantor MCP] 新建 MCP 会话: ${sessionId}`)
  }
  
  // 按需初始化连接
  if (!serverContext.initialized) {
    await serverContext.server.connect(serverContext.transport)
    serverContext.initialized = true
    consola.log(`[Trantor MCP] ${sessionId} 会话已初始化`)
  }
  
  c.set('mcpServer', serverContext)
  c.header('mcp-session-id', sessionId)
  await next()
})
