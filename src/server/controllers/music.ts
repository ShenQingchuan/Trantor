import type { ServerContext } from '../types/index.js'
import { Hono } from 'hono'

const musicRouter = new Hono<ServerContext>()

// QQ音乐API基础地址
const QQ_MUSIC_API_BASE = 'https://qq-music-api.dokduk.cc'

/**
 * 代理QQ音乐歌单详情接口
 * GET /api/music/songlist?id=xxxx
 */
musicRouter.get('/songlist', async (c) => {
  try {
    const playlistId = c.req.query('id')

    if (!playlistId) {
      return c.json({
        success: false,
        message: '缺少歌单ID参数',
      }, 400)
    }

    // 转发请求到QQ音乐API
    const response = await fetch(`${QQ_MUSIC_API_BASE}/songlist?id=${playlistId}`)

    if (!response.ok) {
      throw new Error(`QQ音乐API请求失败: ${response.status}`)
    }

        const data: any = await response.json()
    
    // 直接返回QQ音乐API的响应，并添加CORS头
    c.header('Access-Control-Allow-Origin', '*')
    c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    return c.json(data as any)
  }
  catch (error) {
    console.error('音乐代理错误:', error)
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : '获取歌单失败',
    }, 500)
  }
})

/**
 * 代理QQ音乐歌曲播放链接接口
 * GET /api/music/song/urls?id=xxxx
 */
musicRouter.get('/song/urls', async (c) => {
  try {
    const songmid = c.req.query('id')

    if (!songmid) {
      return c.json({
        success: false,
        message: '缺少歌曲ID参数',
      }, 400)
    }

    // 转发请求到QQ音乐API
    const response = await fetch(`${QQ_MUSIC_API_BASE}/song/urls?id=${songmid}`)

    if (!response.ok) {
      throw new Error(`QQ音乐API请求失败: ${response.status}`)
    }

    const data: any = await response.json()

    // 直接返回QQ音乐API的响应，并添加CORS头
    c.header('Access-Control-Allow-Origin', '*')
    c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    return c.json(data as any)
  }
  catch (error) {
    console.error('音乐播放链接代理错误:', error)
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : '获取播放链接失败',
    }, 500)
  }
})

/**
 * 处理CORS预检请求
 */
musicRouter.options('*', (c) => {
  c.header('Access-Control-Allow-Origin', '*')
  c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return c.text('')
})

export { musicRouter }
