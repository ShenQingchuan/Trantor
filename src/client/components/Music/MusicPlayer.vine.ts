import { formatDuration } from '../../requests/music'
import { useMusicStore } from '../../stores/musicStore'

export function MusicPlayer() {
  const musicStore = useMusicStore()
  const { playerState, songs } = storeToRefs(musicStore)

  const progressPercentage = computed(() => {
    if (playerState.value.duration === 0)
      return 0
    return (playerState.value.currentTime / playerState.value.duration) * 100
  })

  const volumePercentage = computed(() => playerState.value.volume * 100)
  const progressPercentageStyle = computed(() => ({ width: `${progressPercentage.value}%` }))
  const volumePercentageStyle = computed(() => ({ width: `${volumePercentage.value}%` }))
  const playerArtists = computed(() => playerState.value.currentSong?.ar.map(artist => artist.name).join(', '))

  const handlePlayPause = () => {
    if (playerState.value.isPlaying) {
      musicStore.pause()
    }
    else {
      musicStore.play()
    }
  }

  const handleProgressSeek = (event: MouseEvent) => {
    const progressBar = event.currentTarget as HTMLElement
    const rect = progressBar.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const percentage = clickX / rect.width
    const seekTime = percentage * playerState.value.duration
    musicStore.seekTo(seekTime)
  }

  const handleVolumeChange = (event: MouseEvent) => {
    const volumeBar = event.currentTarget as HTMLElement
    const rect = volumeBar.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, clickX / rect.width))
    musicStore.setVolume(percentage)
  }

  const handlePrevious = () => {
    musicStore.playPrevious()
  }

  const handleNext = () => {
    musicStore.playNext()
  }

  const handleToggleMute = () => {
    musicStore.toggleMute()
  }

  const currentSongIndex = computed(() => {
    if (!playerState.value.currentSong)
      return -1
    return songs.value.findIndex(song => song.id === playerState.value.currentSong!.id)
  })

  return vine`
    <div class="h-full col-flex bg-white dark:bg-zinc-950">
      <!-- 当前播放歌曲信息 -->
      <div class="flex-1 col-flex items-center justify-center p-8">
        <div v-if="!playerState.currentSong" class="col-flex items-center gap-4 text-center">
          <div class="i-ic:music-note text-8xl text-zinc-300 dark:text-zinc-600" />
          <div class="text-xl text-zinc-500 dark:text-zinc-400">请选择一首歌曲开始播放</div>
        </div>

        <div v-else class="col-flex items-center gap-6 max-w-md w-full">
          <!-- 专辑封面 -->
          <div class="relative">
            <img
              :src="playerState.currentSong.al.picUrl"
              :alt="playerState.currentSong.al.name"
              class="w-48 h-48 rounded-full shadow-2xl object-cover transition-transform duration-9000"
              :class="{
                'animate-spin animate-duration-6000': playerState.isPlaying,
                'animate-pulse': !playerState.isPlaying,
              }"
            />
            <div v-if="playerState.isPlaying" class="absolute inset-0 bg-black/5 rounded-full" />
          </div>

          <!-- 歌曲信息 -->
          <div class="text-center w-full">
            <h1 class="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-2 truncate">
              {{ playerState.currentSong.name }}
            </h1>
            <p class="text-lg text-zinc-600 dark:text-zinc-400 truncate">
              {{ playerArtists }}
            </p>
            <p class="text-sm text-zinc-500 dark:text-zinc-500 mt-1 truncate">
              {{ playerState.currentSong.al.name }}
            </p>
          </div>

          <!-- 进度条 -->
          <div class="w-full col-flex gap-2">
            <div
              @click="handleProgressSeek"
              class="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full cursor-pointer group"
            >
              <div
                class="h-full bg-blue-500 rounded-full transition-all group-hover:bg-blue-600"
                :style="progressPercentageStyle"
              />
            </div>
            <div class="row-flex justify-between text-xs text-zinc-500 tabular-nums">
              <span>{{ formatDuration(playerState.currentTime * 1000) }}</span>
              <span>{{ formatDuration(playerState.duration * 1000) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 控制栏 -->
      <div class="row-flex border-t border-zinc-200 dark:border-zinc-700 p-4">
        <div class="row-flex items-center justify-center gap-8">
          <!-- 上一首 -->
          <button
            @click="handlePrevious"
            :disabled="!playerState.currentSong || songs.length <= 1"
            class="p-3 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="上一首"
          >
            <div class="i-ic:skip-previous text-2xl text-zinc-600 dark:text-zinc-400" />
          </button>

          <!-- 播放/暂停 -->
          <button
            @click="handlePlayPause"
            :disabled="!playerState.currentSong"
            class="p-4 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :title="playerState.isPlaying ? '暂停' : '播放'"
          >
            <div v-if="playerState.isPlaying" class="i-ic:pause text-3xl" />
            <div v-else class="i-ic:play-arrow text-3xl" />
          </button>

          <!-- 下一首 -->
          <button
            @click="handleNext"
            :disabled="!playerState.currentSong || songs.length <= 1"
            class="p-3 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="下一首"
          >
            <div class="i-ic:skip-next text-2xl text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        <!-- 音量控制 -->
        <div class="row-flex items-center justify-center gap-3 ml-auto">
          <button
            @click="handleToggleMute"
            class="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            :title="playerState.isMuted ? '取消静音' : '静音'"
          >
            <div
              v-if="playerState.isMuted || playerState.volume === 0"
              class="i-ic:volume-off text-lg text-zinc-600 dark:text-zinc-400"
            />
            <div
              v-else-if="playerState.volume < 0.5"
              class="i-ic:volume-down text-lg text-zinc-600 dark:text-zinc-400"
            />
            <div v-else class="i-ic:volume-up text-lg text-zinc-600 dark:text-zinc-400" />
          </button>

          <div
            @click="handleVolumeChange"
            class="w-24 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full cursor-pointer group"
          >
            <div
              class="h-full bg-blue-500 rounded-full transition-all group-hover:bg-blue-600"
              :style="volumePercentageStyle"
            />
          </div>

          <span class="text-xs text-zinc-500 tabular-nums w-8">
            {{ Math.round(volumePercentage) }}%
          </span>
        </div>
      </div>
    </div>
  `
}
