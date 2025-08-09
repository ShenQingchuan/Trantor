import { randomUUID } from 'node:crypto'
import { StreamableHTTPTransport } from '@hono/mcp'
import consola from 'consola'
import { setupMcpServer } from '../services/mcp/setup.js'
import { createTrantorMiddleware } from '../utils/setup.js'

const server = setupMcpServer()
const transport = new StreamableHTTPTransport({
  sessionIdGenerator: () => {
    const newSessionId = randomUUID()
    consola.log(`[Trantor MCP] 新建 MCP 会话: ${newSessionId}`)
    return newSessionId
  },
  onsessionclosed: (sessionId) => {
    consola.log(`[Trantor MCP] MCP 会话已关闭: ${sessionId}`)
  },
})
const mcpServerContext = {
  server,
  transport,
  initialized: false,
  connectTransport: async () => {
    if (mcpServerContext.initialized) {
      return
    }
    await server.connect(transport)
    mcpServerContext.initialized = true
  },
}

export const mcpMiddleware = createTrantorMiddleware(async (c, next) => {
  c.set('mcpServer', mcpServerContext)
  await mcpServerContext.connectTransport()
  await next()
})
