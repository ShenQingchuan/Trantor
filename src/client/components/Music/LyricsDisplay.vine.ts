import { useI18n } from 'vue-i18n'
import { useMusicStore } from '../../stores/musicStore'

export function LyricsDisplay() {
  const { t } = useI18n()
  const musicStore = useMusicStore()
  const { isLoadingLyric, parsedLyrics, scrollLyricLines } = storeToRefs(musicStore)

  return vine`
    <div class="w-full h-32 col-flex items-center justify-center relative overflow-hidden">
      <div v-if="isLoadingLyric" class="text-center text-zinc-500 dark:text-zinc-400">
        <div class="i-ic:sync text-lg animate-spin mb-2" />
        <div class="text-sm">{{ t('os_common_loading') }}</div>
      </div>

      <div v-else-if="parsedLyrics.length === 0" class="text-center text-zinc-500 dark:text-zinc-400">
        <div class="i-ic:music-note text-lg mb-2" />
        <div class="text-sm">{{ t('music_lyrics') }}</div>
      </div>

      <div v-else class="col-flex items-center gap-3 text-center">
        <!-- 前一句 (-1) -->
        <div
          v-if="scrollLyricLines.lines[0]"
          class="text-sm text-zinc-400 dark:text-zinc-500 transition-all duration-300"
        >
          {{ scrollLyricLines.lines[0].text }}
        </div>

        <!-- 当前句 (0) -->
        <div
          v-if="scrollLyricLines.lines[1]"
          class="text-lg font-semibold text-blue-600 dark:text-blue-400 transition-all duration-300"
        >
          {{ scrollLyricLines.lines[1].text }}
        </div>

        <!-- 后一句 (+1) -->
        <div
          v-if="scrollLyricLines.lines[2]"
          class="text-sm text-zinc-400 dark:text-zinc-500 transition-all duration-300"
        >
          {{ scrollLyricLines.lines[2].text }}
        </div>

        <!-- 后两句 (+2) -->
        <div
          v-if="scrollLyricLines.lines[3]"
          class="text-xs text-zinc-300 dark:text-zinc-600 transition-all duration-300"
        >
          {{ scrollLyricLines.lines[3].text }}
        </div>
      </div>
    </div>
  `
}
