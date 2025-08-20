import type { DeepReadonly } from 'vue'
import type { PlayerState, PlaylistDetail, Song } from '../../bridge/types/music'
import { useQuery } from '@pinia/colada'
import { fetchPlaylistDetail, getSongPlayUrl } from '../requests/music'

const musicStoreId = 'trantor:music-store' as const

export type ReadonlySong = DeepReadonly<Song>

export const useMusicStore = defineStore(musicStoreId, () => {
  // 歌单ID - 用户的歌单
  const PLAYLIST_ID = 10164071479

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
  } = useQuery<PlaylistDetail>({
    key: ['playlist', PLAYLIST_ID],
    query: () => fetchPlaylistDetail(PLAYLIST_ID),
    staleTime: 10 * 60 * 1000, // 10分钟内不重新获取
    gcTime: 30 * 60 * 1000, // 30分钟缓存时间
  })

  const playlist = computed(() => playlistState.value?.data || null)
  const songs = computed(() => playlist.value?.tracks || [])
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
      playerState.duration = audio.duration
    })

    audio.addEventListener('timeupdate', () => {
      playerState.currentTime = audio.currentTime
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
  const playSong = async (song: ReadonlySong) => {
    initAudioElement()

    if (!audioElement.value)
      return

    try {
      // 如果是同一首歌，切换播放/暂停状态
      if (playerState.currentSong?.id === song.id) {
        if (playerState.isPlaying) {
          await pause()
        }
        else {
          await play()
        }
        return
      }

      // 播放新歌曲
      playerState.currentSong = song as Song
      audioElement.value.src = await getSongPlayUrl(song.id)

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

    const currentIndex = songs.value.findIndex(song => song.id === playerState.currentSong!.id)
    const nextIndex = (currentIndex + 1) % songs.value.length
    playSong(songs.value[nextIndex])
  }

  // 播放上一首
  const playPrevious = () => {
    if (!playerState.currentSong || songs.value.length === 0)
      return

    const currentIndex = songs.value.findIndex(song => song.id === playerState.currentSong!.id)
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
