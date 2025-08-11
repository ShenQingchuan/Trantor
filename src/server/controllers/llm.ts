import { authMiddleware, requirePermission } from '../middlewares/auth.js'
import { handleChatCompletionsRequest } from '../services/llm/handler.js'
import { createRouter } from '../utils/setup.js'

// /llm
const llmRouter = createRouter()

// Chat completions require authentication and chat.send permission
llmRouter.post('/chat/completions', authMiddleware, requirePermission('chat', 'chat.send'), ...handleChatCompletionsRequest,
)

export {
  llmRouter,
}
