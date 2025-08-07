import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import consola from 'consola'
import { registerTools } from './tools/index.js'

export function setupMcpServer() {
  const server = new McpServer({
    name: 'trantor-mcp',
    version: '1.0.0',
  })

  // 注册所有工具
  registerTools(server)
  consola.success('[Trantor MCP] AI 工具调用注册完成！')

  return server
}
