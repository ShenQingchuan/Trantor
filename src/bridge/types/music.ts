// 音乐相关类型定义

/**
 * 歌曲信息
 */
export interface Song {
  id: number
  name: string
  ar: { id: number, name: string }[] // 艺术家
  al: { id: number, name: string, picUrl: string } // 专辑
  dt: number // 时长(毫秒)
}

/**
 * 歌单详情
 */
export interface PlaylistDetail {
  id: number
  name: string
  description: string
  coverImgUrl: string
  trackIds: { id: number }[]
  tracks: Song[]
  trackCount: number
}

/**
 * 网易云音乐 API 响应格式
 */
export interface NeteaseMusicApiResponse<T = any> {
  code: number
  message?: string
  data?: T
  playlist?: T
}

/**
 * 播放器状态
 */
export interface PlayerState {
  currentSong: Song | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
}
