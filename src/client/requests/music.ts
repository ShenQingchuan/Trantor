import type { NeteaseMusicApiResponse, PlaylistDetail } from '../../bridge/types/music'

// 网易云音乐 API 基础地址
const MUSIC_API_BASE = 'https://nmapi.univedge.cn'

/**
 * 获取歌单详情
 */
export async function fetchPlaylistDetail(playlistId: number): Promise<PlaylistDetail> {
  const response = await fetch(`${MUSIC_API_BASE}/playlist/detail?id=${playlistId}`)
  if (!response.ok) {
    throw new Error(`获取歌单详情失败: ${response.status}`)
  }

  const result: NeteaseMusicApiResponse<PlaylistDetail> = await response.json()

  if (result.code !== 200) {
    throw new Error(`API 错误: ${result.message || result.code}`)
  }

  return result.playlist!
}

/**
 * 获取歌曲播放 URL
 */
export async function getSongPlayUrl(songId: number): Promise<string> {
  const response = await fetch(`${MUSIC_API_BASE}/song/url/v1?id=${songId}&level=standard`)
  if (!response.ok) {
    throw new Error(`获取播放链接失败: ${response.status}`)
  }

  const result = await response.json()

  if (result.code !== 200) {
    throw new Error(`API 错误: ${result.message || result.code}`)
  }

  // 检查返回的URL是否有效
  const playUrl = result.data?.[0]?.url
  if (!playUrl) {
    throw new Error('未获取到有效的播放链接')
  }

  return playUrl
}

/**
 * 格式化歌曲时长（毫秒转为 MM:SS）
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
