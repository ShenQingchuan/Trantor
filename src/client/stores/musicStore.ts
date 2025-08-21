import type { DeepReadonly } from 'vue'
import type { PlayerState, QQMusicLyric, QQMusicPlaylist, QQMusicSong } from '../../bridge/types/music'
import { useQuery } from '@pinia/colada'
import { fetchPlaylistDetail, getSongLyric, getSongPlayUrl } from '../requests/music'
import { getCurrentLyricIndex, getScrollLyricLines, parseLyric } from '../utils/lyricParser'

const musicStoreId = 'trantor:music-store' as const

export type ReadonlyQQMusicSong = DeepReadonly<QQMusicSong>

// 播放模式枚举
export enum PlayMode {
  LIST_LOOP = 'list_loop', // 列表循环
  RANDOM = 'random', // 随机播放
  SINGLE_LOOP = 'single_loop', // 单曲循环
  SEQUENTIAL = 'sequential', // 顺序播放（播放完停止）
}

export const useMusicStore = defineStore(musicStoreId, () => {
  // 播放器状态
  const playerState = reactive<PlayerState>({
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
  })

  // 播放模式
  const playMode = ref<PlayMode>(PlayMode.LIST_LOOP)

  // 当前播放的音频元素
  const audioElement = ref<HTMLAudioElement | null>(null)

  // 获取歌单详情
  const {
    state: playlistState,
    asyncStatus: playlistStatus,
    refresh: refreshPlaylist,
  } = useQuery<QQMusicPlaylist>({
    key: ['qqmusicPlaylist'],
    query: () => fetchPlaylistDetail(),
    staleTime: 10 * 60 * 1000, // 10分钟内不重新获取
    gcTime: 30 * 60 * 1000, // 30分钟缓存时间
  })

  const playlist = computed(() => playlistState.value?.data || null)
  const songs = computed(() => playlist.value?.songlist || [])
  const isLoadingPlaylist = computed(() => playlistStatus.value === 'loading')

  // 获取歌词
  const {
    state: lyricState,
    asyncStatus: lyricStatus,
  } = useQuery<QQMusicLyric>({
    key: ['qqmusicLyric', playerState.currentSong?.songmid || ''],
    query: () => {
      if (!playerState.currentSong?.songmid) {
        throw new Error('没有当前播放歌曲')
      }
      return getSongLyric(playerState.currentSong.songmid)
    },
    enabled: computed(() => !!playerState.currentSong?.songmid),
    staleTime: 5 * 60 * 1000, // 5分钟内不重新获取
    gcTime: 10 * 60 * 1000, // 10分钟缓存时间
  })

  const currentLyric = computed(() => lyricState.value?.data || null)
  const isLoadingLyric = computed(() => lyricStatus.value === 'loading')

  // 歌词解析和滚动逻辑
  const parsedLyrics = computed(() => {
    if (!currentLyric.value?.lyric) return []
    return parseLyric(currentLyric.value.lyric)
  })

  const currentLyricIndex = computed(() => {
    if (parsedLyrics.value.length === 0) return -1
    return getCurrentLyricIndex(parsedLyrics.value, playerState.currentTime)
  })

  const scrollLyricLines = computed(() => {
    if (currentLyricIndex.value === -1) return { lines: [], currentIndex: -1 }
    return getScrollLyricLines(parsedLyrics.value, currentLyricIndex.value)
  })

  // 切换播放模式
  const togglePlayMode = () => {
    const modes = Object.values(PlayMode)
    const currentIndex = modes.indexOf(playMode.value)
    const nextIndex = (currentIndex + 1) % modes.length
    playMode.value = modes[nextIndex]
    console.log('[MusicStore] 播放模式切换为:', playMode.value)
  }

  // 根据播放模式获取下一首歌曲
  const getNextSong = (): ReadonlyQQMusicSong | null => {
    if (!playerState.currentSong || songs.value.length === 0)
      return null

    const currentIndex = songs.value.findIndex(song => song.songmid === playerState.currentSong!.songmid)
    let nextIndex: number
    let randomIndex: number

    switch (playMode.value) {
      case PlayMode.LIST_LOOP:
        // 列表循环：播放完最后一首后回到第一首
        nextIndex = (currentIndex + 1) % songs.value.length
        return songs.value[nextIndex]

      case PlayMode.RANDOM:
        // 随机播放：随机选择一首歌（不包括当前播放的）
        if (songs.value.length === 1)
          return songs.value[0]
        do {
          randomIndex = Math.floor(Math.random() * songs.value.length)
        } while (randomIndex === currentIndex)
        return songs.value[randomIndex]

      case PlayMode.SINGLE_LOOP:
        // 单曲循环：重复播放当前歌曲
        return playerState.currentSong

      case PlayMode.SEQUENTIAL:
        // 顺序播放：播放完最后一首后停止
        if (currentIndex === songs.value.length - 1) {
          return null // 播放完最后一首，停止播放
        }
        nextIndex = currentIndex + 1
        return songs.value[nextIndex]

      default:
        nextIndex = (currentIndex + 1) % songs.value.length
        return songs.value[nextIndex]
    }
  }

  // 根据播放模式获取上一首歌曲
  const getPreviousSong = (): ReadonlyQQMusicSong | null => {
    if (!playerState.currentSong || songs.value.length === 0)
      return null

    const currentIndex = songs.value.findIndex(song => song.songmid === playerState.currentSong!.songmid)
    let prevIndex: number
    let randomIndex: number

    switch (playMode.value) {
      case PlayMode.LIST_LOOP:
        // 列表循环：从第一首回到最后一首
        prevIndex = currentIndex === 0 ? songs.value.length - 1 : currentIndex - 1
        return songs.value[prevIndex]

      case PlayMode.RANDOM:
        // 随机播放：随机选择一首歌（不包括当前播放的）
        if (songs.value.length === 1)
          return songs.value[0]
        do {
          randomIndex = Math.floor(Math.random() * songs.value.length)
        } while (randomIndex === currentIndex)
        return songs.value[randomIndex]

      case PlayMode.SINGLE_LOOP:
        // 单曲循环：重复播放当前歌曲
        return playerState.currentSong

      case PlayMode.SEQUENTIAL:
        // 顺序播放：从第一首回到最后一首
        if (currentIndex === 0) {
          prevIndex = songs.value.length - 1
        }
        else {
          prevIndex = currentIndex - 1
        }
        return songs.value[prevIndex]

      default:
        prevIndex = currentIndex === 0 ? songs.value.length - 1 : currentIndex - 1
        return songs.value[prevIndex]
    }
  }

  // 播放
  const play = async () => {
    if (!audioElement.value || !playerState.currentSong)
      return

    try {
      await audioElement.value.play()
    }
    catch (error) {
      console.error('播放失败:', error)
    }
  }

  // 暂停
  const pause = () => {
    if (!audioElement.value)
      return
    audioElement.value.pause()
  }

  // 停止
  const stop = () => {
    if (!audioElement.value)
      return
    audioElement.value.pause()
    audioElement.value.currentTime = 0
    playerState.isPlaying = false
  }

  // 初始化音频元素
  const initAudioElement = () => {
    if (audioElement.value)
      return

    const audio = new Audio()
    audio.preload = 'metadata'

    // 监听音频事件
    audio.addEventListener('loadedmetadata', () => {
      playerState.duration = Math.floor(audio.duration)
    })

    // 减少时间更新频率，避免闪烁和精度问题
    let lastTimeUpdate = 0
    audio.addEventListener('timeupdate', () => {
      const currentTime = Math.floor(audio.currentTime)
      // 只有当秒数真正改变时才更新，减少闪烁
      if (currentTime !== lastTimeUpdate) {
        playerState.currentTime = currentTime
        lastTimeUpdate = currentTime
      }
    })

    audio.addEventListener('play', () => {
      playerState.isPlaying = true
    })

    audio.addEventListener('pause', () => {
      playerState.isPlaying = false
    })

    audio.addEventListener('ended', () => {
      // 歌曲播放结束，根据播放模式决定下一步
      // eslint-disable-next-line ts/no-use-before-define
      handleSongEnded()
    })

    audio.addEventListener('error', () => {
      console.error('音频加载失败')
      playerState.isPlaying = false
    })

    audioElement.value = audio
  }

  // 播放指定歌曲
  const playSong = async (song: ReadonlyQQMusicSong) => {
    initAudioElement()

    if (!audioElement.value)
      return

    try {
      // 如果是同一首歌，切换播放/暂停状态
      if (playerState.currentSong?.songmid === song.songmid) {
        if (playerState.isPlaying) {
          await pause()
        }
        else {
          await play()
        }
        return
      }

      // 播放新歌曲
      playerState.currentSong = song as QQMusicSong

      // 异步获取播放URL
      const playUrl = await getSongPlayUrl(song.songmid)

      audioElement.value.src = playUrl

      // 重置播放状态
      playerState.currentTime = 0
      playerState.duration = 0

      await audioElement.value.load()
      await play()
    }
    catch (error) {
      console.error('播放歌曲失败:', error)
    }
  }

  // 处理歌曲播放结束
  const handleSongEnded = () => {
    const nextSong = getNextSong()
    if (nextSong) {
      // 自动播放下一首
      playSong(nextSong)
    }
    else {
      // 没有下一首，停止播放
      stop()
      console.log('[MusicStore] 播放列表结束')
    }
  }

  // 播放下一首
  const playNext = () => {
    const nextSong = getNextSong()
    if (nextSong) {
      playSong(nextSong)
    }
  }

  // 播放上一首
  const playPrevious = () => {
    const prevSong = getPreviousSong()
    if (prevSong) {
      playSong(prevSong)
    }
  }

  // 设置播放进度
  const seekTo = (time: number) => {
    if (!audioElement.value)
      return
    audioElement.value.currentTime = time
  }

  // 设置音量
  const setVolume = (volume: number) => {
    if (!audioElement.value)
      return
    const clampedVolume = Math.max(0, Math.min(1, volume))
    audioElement.value.volume = clampedVolume
    playerState.volume = clampedVolume
  }

  // 切换静音
  const toggleMute = () => {
    if (!audioElement.value)
      return
    audioElement.value.muted = !audioElement.value.muted
    playerState.isMuted = audioElement.value.muted
  }

  // 清理音频元素
  const cleanup = () => {
    if (audioElement.value) {
      audioElement.value.pause()
      audioElement.value.src = ''
      audioElement.value = null
    }
  }

  // 组件卸载时清理
  onUnmounted(() => {
    cleanup()
  })

  return {
    // 状态
    playlist: readonly(playlist),
    songs: readonly(songs),
    playerState: readonly(playerState),
    playMode: readonly(playMode),
    isLoadingPlaylist: readonly(isLoadingPlaylist),
    currentLyric: readonly(currentLyric),
    isLoadingLyric: readonly(isLoadingLyric),
    parsedLyrics: readonly(parsedLyrics),
    currentLyricIndex: readonly(currentLyricIndex),
    scrollLyricLines: readonly(scrollLyricLines),

    // 方法
    refreshPlaylist,
    playSong,
    play,
    pause,
    stop,
    seekTo,
    setVolume,
    toggleMute,
    playNext,
    playPrevious,
    togglePlayMode,
    initAudioElement,
    cleanup,
  }
})
