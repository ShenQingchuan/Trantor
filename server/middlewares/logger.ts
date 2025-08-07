import consola from 'consola'
import { createTrantorMiddleware } from '../utils/setup.js'

export const loggerMiddleware = createTrantorMiddleware(async (c, next) => {
  const method = c.req.method
  const path = c.req.path
  const url = c.req.url
  const userAgent = c.req.header('user-agent') || 'Unknown'
  const start = Date.now()

  // Log request start
  consola.info(`→ ${method} ${path}`, {
    url,
    userAgent: userAgent.substring(0, 50) + (userAgent.length > 50 ? '...' : ''),
    timestamp: new Date().toISOString(),
  })

  await next()

  // Log request completion
  const duration = Date.now() - start
  const status = c.res.status

  // Choose log level based on status code
  if (status >= 500) {
    consola.error(`← ${method} ${path} ${status} (${duration}ms)`)
  }
  else if (status >= 400) {
    consola.warn(`← ${method} ${path} ${status} (${duration}ms)`)
  }
  else {
    consola.success(`← ${method} ${path} ${status} (${duration}ms)`)
  }
})
