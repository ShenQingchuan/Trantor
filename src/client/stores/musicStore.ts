import type { DeepReadonly } from 'vue'
import type { PlayerState, QQMusicPlaylist, QQMusicSong } from '../../bridge/types/music'
import { useQuery } from '@pinia/colada'
import { fetchPlaylistDetail, getSongPlayUrl } from '../requests/music'

const musicStoreId = 'trantor:music-store' as const

export type ReadonlyQQMusicSong = DeepReadonly<QQMusicSong>

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
      // 歌曲播放结束，可以自动切换到下一首
      // eslint-disable-next-line ts/no-use-before-define
      playNext()
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

  // 播放下一首
  const playNext = () => {
    if (!playerState.currentSong || songs.value.length === 0)
      return

    const currentIndex = songs.value.findIndex(song => song.songmid === playerState.currentSong!.songmid)
    const nextIndex = (currentIndex + 1) % songs.value.length
    playSong(songs.value[nextIndex])
  }

  // 播放上一首
  const playPrevious = () => {
    if (!playerState.currentSong || songs.value.length === 0)
      return

    const currentIndex = songs.value.findIndex(song => song.songmid === playerState.currentSong!.songmid)
    const prevIndex = currentIndex === 0 ? songs.value.length - 1 : currentIndex - 1
    playSong(songs.value[prevIndex])
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
    isLoadingPlaylist: readonly(isLoadingPlaylist),

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
    initAudioElement,
    cleanup,
  }
})
