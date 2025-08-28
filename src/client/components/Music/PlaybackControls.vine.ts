import { useI18n } from 'vue-i18n'
import { useMusicStore } from '../../stores/musicStore'
import { ProgressBar } from './ProgressBar.vine'

export function PlaybackControls() {
  const { t } = useI18n()
  const musicStore = useMusicStore()
  const { playerState, songs } = storeToRefs(musicStore)

  return vine`
    <div class="w-full col-flex gap-4">
      <!-- 播放控制按钮 -->
      <div class="row-flex items-center justify-center gap-6 mt-2 mb-4">
        <!-- 上一首 -->
        <button
          @click="musicStore.playPrevious"
          :disabled="!playerState.currentSong || songs.length <= 1"
          class="w-8 h-8 rounded-full bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 row-flex flex-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :title="t('music_previous')"
        >
          <div class="i-ic:skip-previous text-lg text-zinc-700 dark:text-zinc-300" />
        </button>

        <!-- 播放/暂停 -->
        <button
          @click="playerState.isPlaying ? musicStore.pause() : musicStore.play()"
          :disabled="!playerState.currentSong"
          class="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white row-flex flex-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          :title="playerState.isPlaying ? t('music_pause') : t('music_play')"
        >
          <div v-if="playerState.isPlaying" class="i-ic:pause text-2xl" />
          <div v-else class="i-ic:play-arrow text-2xl" />
        </button>

        <!-- 下一首 -->
        <button
          @click="musicStore.playNext"
          :disabled="!playerState.currentSong || songs.length <= 1"
          class="w-8 h-8 rounded-full bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 row-flex flex-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :title="t('music_next')"
        >
          <div class="i-ic:skip-next text-lg text-zinc-700 dark:text-zinc-300" />
        </button>
      </div>

      <!-- 进度条 -->
      <ProgressBar />
    </div>
  `
}
