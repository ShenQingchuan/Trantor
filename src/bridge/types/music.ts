// QQ音乐相关类型定义

/**
 * QQ音乐歌手信息
 */
export interface QQMusicSinger {
  id: number
  mid: string
  name: string
}

/**
 * QQ音乐歌曲信息
 */
export interface QQMusicSong {
  songid: number
  songmid: string
  songname: string
  songorig: string
  singer: QQMusicSinger[]
  albumid: number
  albummid: string
  albumname: string
  interval: number // 时长(秒)
  pay: {
    payplay: number
    paydownload: number
    payinfo: number
  }
}

/**
 * QQ音乐歌单详情
 */
export interface QQMusicPlaylist {
  id: string
  name?: string
  dissname: string  // 歌单名称
  logo: string      // 歌单封面图片
  songlist: QQMusicSong[]
  total?: number
}

/**
 * QQ音乐 API 响应格式
 */
export interface QQMusicApiResponse<T = any> {
  result: number
  data: T
  message?: string
}

/**
 * 播放器状态
 */
export interface PlayerState {
  currentSong: QQMusicSong | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
}

/**
 * 歌曲播放URL响应
 */
export interface QQMusicUrlResponse {
  [songmid: string]: string
}

/**
 * 歌词信息
 */
export interface QQMusicLyric {
  lyric: string      // 歌词内容（LRC格式）
  trans?: string     // 翻译歌词（可选）
}

/**
 * 歌词 API 响应
 */
export interface QQMusicLyricResponse {
  result: number
  data: QQMusicLyric
  message?: string
}
