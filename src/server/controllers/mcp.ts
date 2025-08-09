import { handleMcpRequest } from '../services/mcp/handler.js'
import { createRouter } from '../utils/setup.js'

// /mcp
const mcpRouter = createRouter()

mcpRouter.all('/', ...handleMcpRequest)

export {
  mcpRouter,
}
