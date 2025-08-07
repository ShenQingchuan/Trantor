import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import registerGetCurrentTimeTool from './getCurrentTime.js'

export function registerTools(server: McpServer) {
  registerGetCurrentTimeTool(server)
}
