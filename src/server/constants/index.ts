import { join } from 'node:path'
import { env } from 'node:process'

export const STATIC_ROOT = join(import.meta.dirname, '../../static')
export const CONTENT_DIR = join(import.meta.dirname, '../../../content')

// 基本配置
export const SERVER_HTTP_PORT = env.SERVER_HTTP_PORT ? Number(env.SERVER_HTTP_PORT) : undefined
export const SERVER_HTTPS_PORT = env.SERVER_HTTPS_PORT ? Number(env.SERVER_HTTPS_PORT) : undefined

// SSL certificate paths
export const SSL_CERT_PATH = 'server/certs/localhost+2.pem'
export const SSL_KEY_PATH = 'server/certs/localhost+2-key.pem'
