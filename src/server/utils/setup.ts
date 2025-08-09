import type { ServerType } from '@hono/node-server'
import type { MiddlewareHandler } from 'hono'
import type { ServerContext, TrantorHono } from '../types/index.js'
import fs from 'node:fs'
import { createSecureServer } from 'node:http2'
import process, { env } from 'node:process'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { createMiddleware } from 'hono/factory'
import { SERVER_HTTP_PORT, SERVER_HTTPS_PORT, SSL_CERT_PATH, SSL_KEY_PATH } from '../constants/index.js'

function handleShutdownGracefully(
  httpServer: ServerType | null,
  httpsServer?: ServerType | null,
) {
  // graceful shutdown
  const shutdown = () => {
    httpServer?.close()
    httpsServer?.close()
    process.exit(0)
  }

  const shutdownWithError = (err?: Error) => {
    httpServer?.close()
    httpsServer?.close()
    if (err) {
      console.error(err)
      process.exit(1)
    }
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdownWithError)
}

function startGreeting() {
  const boxHeader = '╒══════════════════════════════════════════════════════╕'
  const boxFooter = '╘══════════════════════════════════════════════════════╛'

  const httpLine = SERVER_HTTP_PORT ? `🔗 HTTP:  http://localhost:${SERVER_HTTP_PORT}` : ''
  const httpsLine = SERVER_HTTPS_PORT ? `🔒 HTTPS: https://localhost:${SERVER_HTTPS_PORT}` : ''

  process.stdout.write(`
${boxHeader}
│ ${'🎈 Trantor Node 服务端已启动'.padEnd(boxHeader.length - 10)} │
│ ${httpLine.padEnd(boxHeader.length - 4)} │
${
  (httpsLine ? `│ ${httpsLine.padEnd(boxHeader.length - 4) + '\n'} │` : '') +
  boxFooter
}
`)
}

function createHttpsServer(app: TrantorHono): ServerType | null {
  try {
    // Check if SSL certificates exist
    if (!fs.existsSync(SSL_CERT_PATH) || !fs.existsSync(SSL_KEY_PATH)) {
      console.warn('⚠️  SSL certificates not found, HTTPS server will not start')
      console.warn('   Run: mkcert -install && mkcert localhost 127.0.0.1 ::1')
      return null
    }

    const httpsServer = serve({
      fetch: app.fetch,
      port: SERVER_HTTPS_PORT,
      createServer: createSecureServer,
      serverOptions: {
        key: fs.readFileSync(SSL_KEY_PATH),
        cert: fs.readFileSync(SSL_CERT_PATH),
        allowHTTP1: true, // Allow HTTP/1.1 connections to prevent ALPN protocol errors
      },
    })

    return httpsServer
  }
  catch (error) {
    console.error('❌ Failed to start HTTPS server:', error)
    return null
  }
}

export function serveServer(app: TrantorHono) {
  let httpServer: ServerType | null = null
  let httpsServer: ServerType | null = null

  if (env.NODE_ENV === 'production') {
    // Production: Only HTTP server (Docker container)
    const port = Number(env.SERVER_HTTP_PORT || env.PORT) || 80
    httpServer = serve({
      fetch: app.fetch,
      port,
    })
    console.log(`🚀 生产服务器运行在端口 ${port}`)
  }
  else {
    // Development: HTTP + HTTPS servers
    if (SERVER_HTTP_PORT) {
      httpServer = serve({
        fetch: app.fetch,
        port: SERVER_HTTP_PORT,
      })
    }

    // Start HTTPS server for development (only if HTTPS port is configured)
    if (SERVER_HTTPS_PORT) {
      httpsServer = createHttpsServer(app)
    }
  }

  handleShutdownGracefully(httpServer, httpsServer || undefined)

  // Only show greeting in development
  if (env.NODE_ENV !== 'production') {
    startGreeting()
  }
}

export function createRouter() {
  return new Hono<ServerContext>()
}
export function createTrantorMiddleware(handler: MiddlewareHandler<ServerContext>) {
  return createMiddleware<ServerContext>(handler)
}
