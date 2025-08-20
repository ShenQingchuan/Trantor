import type { QQMusicApiResponse, QQMusicPlaylist, QQMusicSinger, QQMusicUrlResponse } from '../../bridge/types/music'

// 使用本地服务器代理
const MUSIC_API_BASE = '/api/music'

// 您的歌单ID
const PLAYLIST_ID = '9562819623'

/**
 * 获取歌单详情
 */
export async function fetchPlaylistDetail(): Promise<QQMusicPlaylist> {
  const response = await fetch(`${MUSIC_API_BASE}/songlist?id=${PLAYLIST_ID}`)
  if (!response.ok) {
    throw new Error(`获取歌单详情失败: ${response.status}`)
  }

  const result: QQMusicApiResponse<QQMusicPlaylist> = await response.json()

  if (result.result !== 100) {
    throw new Error(`API 错误: ${result.message || result.result}`)
  }

  return result.data
}

/**
 * 获取歌曲播放 URL
 */
export async function getSongPlayUrl(songmid: string): Promise<string> {
  const response = await fetch(`${MUSIC_API_BASE}/song/urls?id=${songmid}`)
  if (!response.ok) {
    throw new Error(`获取播放链接失败: ${response.status}`)
  }

  const result: QQMusicApiResponse<QQMusicUrlResponse> = await response.json()

  if (result.result !== 100) {
    throw new Error(`API 错误: ${result.message || result.result}`)
  }

  // 获取对应songmid的播放URL
  const playUrl = result.data[songmid]
  if (!playUrl) {
    throw new Error('未获取到有效的播放链接')
  }

  return playUrl
}

/**
 * 格式化歌曲时长（秒转为 MM:SS）
 */
export function formatDuration(seconds: number): string {
  // 确保输入是有效数字，避免NaN和Infinity
  if (!isFinite(seconds) || seconds < 0) {
    return '0:00'
  }
  
  // 使用Math.floor确保整数，避免浮点数精度问题
  const totalSeconds = Math.floor(seconds)
  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = totalSeconds % 60
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * 获取歌手名称字符串
 */
export function getArtistNames(singers: readonly QQMusicSinger[]): string {
  return singers.map(singer => singer.name).join(', ')
}
