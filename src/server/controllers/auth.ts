import type { ServerContext } from '../types/index.js'
import { Hono } from 'hono'
import { authMiddleware, ownerOnlyMiddleware, rateLimitMiddleware } from '../middlewares/auth.js'
import { authHandler } from '../services/auth/handler.js'

export const authRouter = new Hono<ServerContext>()

// Rate limiting for auth endpoints
const authRateLimit = rateLimitMiddleware({
  authenticatedLimit: 60, // 60 requests per minute for authenticated users
  anonymousLimit: 10, // 10 requests per minute for anonymous users
  windowMs: 60 * 1000, // 1 minute
})

// Public endpoints (no authentication required)
authRouter.post('/login', authRateLimit, authHandler.login.bind(authHandler))
authRouter.get('/apps', authHandler.getApps.bind(authHandler))

// Protected endpoints (authentication required)
authRouter.use('/*', authMiddleware)
authRouter.get('/me', authHandler.getCurrentUser.bind(authHandler))
authRouter.get('/permissions/:appId', authHandler.getUserPermissions.bind(authHandler))
authRouter.post('/tokens', authHandler.createToken.bind(authHandler))
authRouter.delete('/tokens/:token', authHandler.revokeToken.bind(authHandler))

// Owner-only endpoints
authRouter.use('/guest', ownerOnlyMiddleware)
authRouter.post('/guest', authHandler.createGuestAccess.bind(authHandler))

authRouter.use('/config', ownerOnlyMiddleware)
authRouter.get('/config', authHandler.getConfig.bind(authHandler))
authRouter.put('/config', authHandler.updateConfig.bind(authHandler))
