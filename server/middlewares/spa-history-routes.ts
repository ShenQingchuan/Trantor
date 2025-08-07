import { existsSync } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { createTrantorMiddleware } from '../utils/setup.js'

export const spaHistoryRoutesMiddleware = createTrantorMiddleware(async (c, next) => {
  const path = c.req.path

  // 跳过 API 路由
  if (path.startsWith('/api/')) {
    return next()
  }

  // 检查是否为静态文件请求
  const staticRoot = join(import.meta.dirname, '../../static')
  const filePath = join(staticRoot, path)

  // 如果文件存在且不是目录，则继续到静态文件服务
  if (existsSync(filePath)) {
    const stats = await stat(filePath)
    if (stats.isFile()) {
      return next()
    }
  }

  // 对于不存在的文件或目录，返回 index.html 让 SPA 处理路由
  const indexPath = join(staticRoot, 'index.html')
  if (existsSync(indexPath)) {
    return c.html(await readFile(indexPath, 'utf-8'))
  }

  // 如果连 index.html 都不存在，继续到下一个中间件
  return next()
})
