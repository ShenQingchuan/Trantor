import { cleanupCacheHandler, getCacheStatusHandler, refreshCacheHandler } from '../services/articles/cache-handler.js'
import { getArticleHandler, getArticleListHandler } from '../services/articles/handler.js'
import { createRouter } from '../utils/setup.js'

const articlesRouter = createRouter()

articlesRouter.get('/list', ...getArticleListHandler)
articlesRouter.get('/:path', ...getArticleHandler)

// 缓存管理路由
articlesRouter.post('/cache/cleanup', ...cleanupCacheHandler)
articlesRouter.get('/cache/status/:fileName', ...getCacheStatusHandler)
articlesRouter.post('/cache/refresh/:fileName', ...refreshCacheHandler)

export { articlesRouter }
