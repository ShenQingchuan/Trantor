import { formatDuration } from '../../requests/music'
import { useMusicStore } from '../../stores/musicStore'

export function ProgressBar() {
  const musicStore = useMusicStore()
  const { playerState } = storeToRefs(musicStore)

  const progressPercentage = computed(() => {
    if (playerState.value.duration === 0)
      return 0
    return (playerState.value.currentTime / playerState.value.duration) * 100
  })

  const progressStyle = computed(() => ({ width: `${progressPercentage.value}%` }))

  const handleProgressSeek = (event: MouseEvent) => {
    const progressBar = event.currentTarget as HTMLElement
    const rect = progressBar.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const percentage = clickX / rect.width
    const seekTime = percentage * playerState.value.duration
    musicStore.seekTo(seekTime)
  }

  return vine`
    <div class="w-full col-flex gap-1">
      <div
        @click="handleProgressSeek"
        class="w-full h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full cursor-pointer group"
      >
        <div
          class="h-full bg-blue-500 rounded-full transition-all group-hover:bg-blue-600"
          :style="progressStyle"
        />
      </div>
      <div class="row-flex justify-between text-xs text-zinc-500 tabular-nums">
        <span>{{ formatDuration(playerState.currentTime) }}</span>
        <span>{{ formatDuration(playerState.duration) }}</span>
      </div>
    </div>
  `
}
