import type { ServerContext } from './types/index.js'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { STATIC_ROOT } from './constants/index.js'
import { articlesRouter } from './controllers/articles.js'
import { authRouter } from './controllers/auth.js'
import { chatFlowRouter } from './controllers/chatflow.js'
import { llmRouter } from './controllers/llm.js'
import { mcpRouter } from './controllers/mcp.js'
import { llmClientMiddleware } from './middlewares/llmClient.js'
import { loggerMiddleware } from './middlewares/logger.js'
import { markdownItMiddleware } from './middlewares/markdownIt.js'
import { mcpMiddleware } from './middlewares/mcp.js'
import { spaHistoryRoutesMiddleware } from './middlewares/toSpaHistoryRouter.js'
import { serveServer } from './utils/setup.js'

const app = new Hono<ServerContext>()

// 中间件注册 (必须在路由之前)
app.use(loggerMiddleware)
app.use(mcpMiddleware)
app.use(llmClientMiddleware)
app.use(markdownItMiddleware)
app.use(spaHistoryRoutesMiddleware)
app.use(serveStatic({ root: STATIC_ROOT }))

// API 路由注册
const apiRouter = new Hono<ServerContext>()

// 健康检查端点
apiRouter.get('/ping', (c) => {
  return c.json({
    status: 'ok',
    message: 'pong',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
})
apiRouter.route('/auth', authRouter)
apiRouter.route('/mcp', mcpRouter)
apiRouter.route('/llm', llmRouter)
apiRouter.route('/articles', articlesRouter)
apiRouter.route('/chatflow', chatFlowRouter)

app.route('/api', apiRouter)

serveServer(app)
