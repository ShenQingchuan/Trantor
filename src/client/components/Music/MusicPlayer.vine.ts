import { formatDuration, getArtistNames } from '../../requests/music'
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

  return vine`
    <div
      class="h-full col-flex bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950"
    >
      <!-- iPod 风格紧凑播放器 -->
      <div class="flex-1 col-flex items-center justify-center p-4">
        <div v-if="!playerState.currentSong" class="col-flex items-center gap-3 text-center">
          <div class="i-ic:music-note text-6xl text-zinc-300 dark:text-zinc-600" />
          <div class="text-sm text-zinc-500 dark:text-zinc-400">请选择歌曲播放</div>
        </div>

        <div v-else class="col-flex items-center gap-4 max-w-sm w-full">
          <!-- 歌曲信息 -->
          <div class="text-center w-full">
            <h1 class="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-2 truncate">
              {{ playerState.currentSong.songname }}
            </h1>
            <p class="text-base text-zinc-600 dark:text-zinc-400 truncate">
              {{ getArtistNames(playerState.currentSong.singer) }}
            </p>
            <p class="text-sm text-zinc-500 dark:text-zinc-500 mt-1 truncate">
              {{ playerState.currentSong.albumname }}
            </p>
          </div>

          <!-- 紧凑进度条 -->
          <div class="w-full col-flex gap-1">
            <div
              @click="handleProgressSeek"
              class="w-full h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full cursor-pointer group"
            >
              <div
                class="h-full bg-blue-500 rounded-full transition-all group-hover:bg-blue-600"
                :style="progressPercentageStyle"
              />
            </div>
            <div class="row-flex justify-between text-xs text-zinc-500 tabular-nums">
              <span>{{ formatDuration(playerState.currentTime) }}</span>
              <span>{{ formatDuration(playerState.duration) }}</span>
            </div>
          </div>

          <!-- iPod 风格控制按钮 -->
          <div class="row-flex items-center justify-center gap-6 mt-2">
            <!-- 上一首 -->
            <button
              @click="handlePrevious"
              :disabled="!playerState.currentSong || songs.length <= 1"
              class="w-8 h-8 rounded-full bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 row-flex flex-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="上一首"
            >
              <div class="i-ic:skip-previous text-lg text-zinc-700 dark:text-zinc-300" />
            </button>

            <!-- 播放/暂停 -->
            <button
              @click="handlePlayPause"
              :disabled="!playerState.currentSong"
              class="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white row-flex flex-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              :title="playerState.isPlaying ? '暂停' : '播放'"
            >
              <div v-if="playerState.isPlaying" class="i-ic:pause text-2xl" />
              <div v-else class="i-ic:play-arrow text-2xl" />
            </button>

            <!-- 下一首 -->
            <button
              @click="handleNext"
              :disabled="!playerState.currentSong || songs.length <= 1"
              class="w-8 h-8 rounded-full bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 row-flex flex-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="下一首"
            >
              <div class="i-ic:skip-next text-lg text-zinc-700 dark:text-zinc-300" />
            </button>
          </div>
        </div>
      </div>

      <!-- 底部音量控制 -->
      <div
        class="row-flex items-center justify-center gap-3 p-3 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50"
      >
        <button
          @click="handleToggleMute"
          class="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          :title="playerState.isMuted ? '取消静音' : '静音'"
        >
          <div
            v-if="playerState.isMuted || playerState.volume === 0"
            class="i-ic:volume-off text-sm text-zinc-600 dark:text-zinc-400"
          />
          <div
            v-else-if="playerState.volume < 0.5"
            class="i-ic:volume-down text-sm text-zinc-600 dark:text-zinc-400"
          />
          <div v-else class="i-ic:volume-up text-sm text-zinc-600 dark:text-zinc-400" />
        </button>

        <div
          @click="handleVolumeChange"
          class="w-20 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full cursor-pointer group"
        >
          <div
            class="h-full bg-blue-500 rounded-full transition-all group-hover:bg-blue-600"
            :style="volumePercentageStyle"
          />
        </div>

        <span class="text-xs text-zinc-500 tabular-nums w-6 font-sans">
          {{ Math.round(volumePercentage) }}
        </span>
      </div>
    </div>
  `
}
