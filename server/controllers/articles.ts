import { getArticleHandler, getArticleListHandler } from '../services/articles/handler.js'
import { createRouter } from '../utils/setup.js'

const articlesRouter = createRouter()

articlesRouter.get('/list', ...getArticleListHandler)
articlesRouter.get('/:path', ...getArticleHandler)

export { articlesRouter }
