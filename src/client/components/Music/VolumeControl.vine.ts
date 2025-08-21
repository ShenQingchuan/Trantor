import { useToggle } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { useMusicStore } from '../../stores/musicStore'

export function VolumeControl() {
  const { t } = useI18n()
  const musicStore = useMusicStore()
  const { playerState } = storeToRefs(musicStore)

  // 音量控制展开状态
  const [showVolumeControl, toggleVolumeControl] = useToggle(false)

  const volumePercentage = computed(() => playerState.value.volume * 100)
  const volumePercentageStyle = computed(() => ({ width: `${volumePercentage.value}%` }))

  const handleVolumeChange = (event: MouseEvent) => {
    const volumeBar = event.currentTarget as HTMLElement
    const rect = volumeBar.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, clickX / rect.width))
    musicStore.setVolume(percentage)
  }

  return vine`
    <div class="row-flex items-center gap-3">
      <button
        @click="toggleVolumeControl()"
        class="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 row-flex flex-center transition-colors"
        :title="playerState.isMuted ? t('music_unmute') : t('music_mute')"
      >
        <div
          v-if="playerState.isMuted || playerState.volume === 0"
          class="i-ic:volume-off text-lg text-zinc-700 dark:text-zinc-300"
        />
        <div
          v-else-if="playerState.volume < 0.5"
          class="i-ic:volume-down text-lg text-zinc-700 dark:text-zinc-300"
        />
        <div v-else class="i-ic:volume-up text-lg text-zinc-700 dark:text-zinc-300" />
      </button>

      <!-- 展开的音量控制条 -->
      <div v-if="showVolumeControl" class="row-flex items-center gap-2 transition-all duration-200">
        <div
          @click="handleVolumeChange"
          class="w-20 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full cursor-pointer group"
          :title="t('music_volume')"
        >
          <div
            class="h-full bg-blue-500 rounded-full transition-all group-hover:bg-blue-600"
            :style="volumePercentageStyle"
          />
        </div>

        <span class="text-xs text-zinc-500 tabular-nums w-6 font-sans">
          {{ Math.round(volumePercentage) }}
        </span>

        <button
          @click="musicStore.toggleMute"
          class="p-1 rounded hover:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors"
          :title="playerState.isMuted ? t('music_unmute') : t('music_mute')"
        >
          <div class="i-ic:volume-x text-sm text-zinc-500 dark:text-zinc-400" />
        </button>
      </div>
    </div>
  `
}
