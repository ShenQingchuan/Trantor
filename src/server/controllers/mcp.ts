import { handleMcpRequest } from '../services/mcp/handler.js'
import { createRouter } from '../utils/setup.js'

// /mcp
const mcpRouter = createRouter()

// 状态检查端点 - 用于客户端验证服务器状态和会话有效性
mcpRouter.get('/status', async (c) => {
  const sessionId = c.req.query('sessionId')
  const serverContext = c.get('mcpServer')

  return c.json({
    serverStartTime: c.res.headers.get('mcp-server-start-time'),
    sessionValid: !!sessionId, // 简单检查，可以根据需要扩展
    initialized: serverContext?.initialized || false,
    timestamp: Date.now(),
  })
})

mcpRouter.all('/', ...handleMcpRequest)

export {
  mcpRouter,
}
