import { errorResponse } from '../../utils/response.js'
import { handlerFactory } from '../handler-factory.js'

export const handleMcpRequest = handlerFactory.createHandlers(async (c) => {
  const mcpServer = c.get('mcpServer')
  const { transport } = mcpServer

  // 从上下文获取头部信息（由中间件设置）
  const sessionId = c.res.headers.get('mcp-session-id')
  const serverStartTime = c.res.headers.get('mcp-server-start-time')

  // 处理 MCP 请求
  const response = await transport.handleRequest(c)

  if (!response) {
    return errorResponse(c, 500, 'No response from MCP server')
  }

  // 确保头部信息被正确传递到响应中
  if (sessionId) {
    response.headers.set('mcp-session-id', sessionId)
  }
  if (serverStartTime) {
    response.headers.set('mcp-server-start-time', serverStartTime)
  }

  return response
})
