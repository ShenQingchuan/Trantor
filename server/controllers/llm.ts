import { handleChatCompletionsRequest } from '../services/llm/handler.js'
import { createRouter } from '../utils/setup.js'

// /llm
const llmRouter = createRouter()

llmRouter.post('/chat/completions', ...handleChatCompletionsRequest)

export {
  llmRouter,
}
