import type { Context, Next } from 'hono'
import type { ServerContext } from '../types/index.js'
import { authService } from '../services/auth/service.js'
import { createTrantorMiddleware } from '../utils/setup.js'

// Extract token from Authorization header or query parameter
function extractToken(c: Context): string | null {
  // Try Authorization header first (Bearer token)
  const authHeader = c.req.header('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  // Try query parameter as fallback
  const tokenParam = c.req.query('token')
  if (tokenParam) {
    return tokenParam
  }

  return null
}

/**
 * Basic authentication middleware - just verifies token validity
 */
export const authMiddleware = createTrantorMiddleware(async (c: Context<ServerContext>, next: Next) => {
  const token = extractToken(c)

  if (!token) {
    return c.json({
      success: false,
      message: 'Authentication token required',
    }, 401)
  }

  const user = authService.getUserByToken(token)
  if (!user) {
    return c.json({
      success: false,
      message: 'Invalid or expired token',
    }, 401)
  }

  // Attach user to context
  c.set('currentUser', user)
  c.set('authToken', token)

  await next()
})

/**
 * Permission-based middleware factory
 * Creates middleware that checks if user has specific permission for an app
 */
export function requirePermission(appId: string, permissionId: string) {
  return createTrantorMiddleware(async (c: Context<ServerContext>, next: Next) => {
    const user = c.get('currentUser')

    if (!user) {
      return c.json({
        success: false,
        message: 'Authentication required',
      }, 401)
    }

    const hasPermission = authService.checkPermission({
      userId: user.id,
      appId,
      permissionId,
    })

    if (!hasPermission) {
      return c.json({
        success: false,
        message: `Permission denied: ${appId}.${permissionId}`,
      }, 403)
    }

    await next()
  })
}

/**
 * Owner-only middleware
 * Restricts access to system owner only
 */
export const ownerOnlyMiddleware = createTrantorMiddleware(async (c: Context<ServerContext>, next: Next) => {
  const user = c.get('currentUser')

  if (!user) {
    return c.json({
      success: false,
      message: 'Authentication required',
    }, 401)
  }

  if (user.role !== 'owner') {
    return c.json({
      success: false,
      message: 'Owner access required',
    }, 403)
  }

  await next()
})

/**
 * Optional authentication middleware
 * Attempts to authenticate but doesn't fail if no token provided
 * Useful for endpoints that have different behavior for authenticated users
 */
export const optionalAuthMiddleware = createTrantorMiddleware(async (c: Context<ServerContext>, next: Next) => {
  const token = extractToken(c)

  if (token) {
    const user = authService.getUserByToken(token)
    if (user) {
      c.set('currentUser', user)
      c.set('authToken', token)
    }
  }

  await next()
})

/**
 * Rate limiting middleware based on user or IP
 * Provides higher limits for authenticated users
 */
const rateLimitMap = new Map<string, { count: number, resetTime: number }>()

export function rateLimitMiddleware(options: {
  authenticatedLimit: number // requests per minute for authenticated users
  anonymousLimit: number // requests per minute for anonymous users
  windowMs: number // time window in milliseconds
}) {
  return createTrantorMiddleware(async (c: Context<ServerContext>, next: Next) => {
    const user = c.get('currentUser')
    const identifier = user ? `user:${user.id}` : `ip:${c.req.header('x-forwarded-for') || 'unknown'}`

    const now = Date.now()
    const limit = user ? options.authenticatedLimit : options.anonymousLimit

    const current = rateLimitMap.get(identifier)

    if (!current || now > current.resetTime) {
      // Reset or initialize
      rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + options.windowMs,
      })
    }
    else {
      // Increment count
      current.count++

      if (current.count > limit) {
        return c.json({
          success: false,
          message: 'Rate limit exceeded',
          retryAfter: Math.ceil((current.resetTime - now) / 1000),
        }, 429)
      }
    }

    await next()
  })
}
