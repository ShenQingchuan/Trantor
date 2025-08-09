import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

export default function registerTool(
  server: McpServer,
) {
  server.tool(
    'get-current-time',
    '获取当前时间',
    {},
    async () => {
      return {
        content: [
          { type: 'text', text: `当前时间：${new Date().toISOString()}` },
        ],
      }
    },
  )
}
