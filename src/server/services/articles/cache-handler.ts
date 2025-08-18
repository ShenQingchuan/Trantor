import { getErrMsg } from '../../../bridge/utils.js'
import { errorResponse, successResponse } from '../../utils/response.js'
import { handlerFactory } from '../handler-factory.js'
import { articleCacheService } from './cache-service.js'

/**
 * 清理孤立的缓存记录（对应文件已删除）
 */
export const cleanupCacheHandler = handlerFactory.createHandlers(async (c) => {
  try {
    await articleCacheService.cleanupOrphanedCache()
    return successResponse(c, { message: '缓存清理完成' })
  }
  catch (error) {
    return errorResponse(c, 500, `缓存清理失败: ${getErrMsg(error)}`)
  }
})

/**
 * 获取缓存状态信息
 */
export const getCacheStatusHandler = handlerFactory.createHandlers(async (c) => {
  const fileName = c.req.param('fileName')
  if (!fileName) {
    return errorResponse(c, 400, '缺少文件名参数')
  }

  try {
    const status = await articleCacheService.checkCacheStatus(fileName)
    return successResponse(c, status)
  }
  catch (error) {
    return errorResponse(c, 500, `获取缓存状态失败: ${getErrMsg(error)}`)
  }
})

/**
 * 强制刷新指定文章的缓存
 */
export const refreshCacheHandler = handlerFactory.createHandlers(async (c) => {
  const fileName = c.req.param('fileName')
  const theme = c.req.query('theme')

  if (!fileName) {
    return errorResponse(c, 400, '缺少文件名参数')
  }

  try {
    const markdownIt = c.get('markdownIt')
    const result = await articleCacheService.renderAndCacheArticle(fileName, markdownIt, theme)

    return successResponse(c, {
      message: '缓存刷新成功',
      article: {
        fileName,
        metadata: result.metadata,
      },
    })
  }
  catch (error) {
    return errorResponse(c, 500, `缓存刷新失败: ${getErrMsg(error)}`)
  }
})
