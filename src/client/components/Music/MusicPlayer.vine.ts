import { useToggle } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { getArtistNames } from '../../requests/music'
import { PlayMode, useMusicStore } from '../../stores/musicStore'
import { LyricsDisplay } from './LyricsDisplay.vine'
import { PlaybackControls } from './PlaybackControls.vine'
import { VolumeControl } from './VolumeControl.vine'

export function MusicPlayer() {
  const musicStore = useMusicStore()
  const { playerState, songs, playMode } = storeToRefs(musicStore)
  const { t } = useI18n()

  // 歌词界面显示状态
  const [showLyrics, toggleLyrics] = useToggle(false)

  // 播放模式图标和提示
  const playModeInfo = computed(() => {
    switch (playMode.value) {
      case PlayMode.LIST_LOOP:
        return { icon: 'i-ic:sharp-repeat', title: t('music_play_mode_list_loop') }
      case PlayMode.RANDOM:
        return { icon: 'i-ic:sharp-shuffle', title: t('music_play_mode_random') }
      case PlayMode.SINGLE_LOOP:
        return { icon: 'i-ic:sharp-repeat-one', title: t('music_play_mode_single_loop') }
      case PlayMode.SEQUENTIAL:
        return { icon: 'i-ic:sharp-playlist-play', title: t('music_play_mode_sequential') }
      default:
        return { icon: 'i-ic:sharp-repeat', title: t('music_play_mode_list_loop') }
    }
  })

  const handleTogglePlayMode = () => {
    musicStore.togglePlayMode()
  }

  return vine`
    <div
      class="h-full col-flex bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950"
    >
      <!-- iPod 风格紧凑播放器 -->
      <div class="flex-1 col-flex items-center justify-center p-4">
        <div v-if="!playerState.currentSong" class="col-flex items-center gap-3 text-center">
          <div class="i-ic:music-note text-6xl text-zinc-300 dark:text-zinc-600" />
          <div class="text-sm text-zinc-500 dark:text-zinc-400">{{ t('music_select_song') }}</div>
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

          <!-- 滚动歌词显示界面 -->
          <div v-if="showLyrics" class="w-full col-flex gap-4">
            <LyricsDisplay />
          </div>

          <!-- 播放控制按钮 -->
          <PlaybackControls />
        </div>
      </div>

      <!-- 底部控制区域：播放模式 + 音量控制 -->
      <div
        class="row-flex items-center justify-center gap-6 p-3 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50"
      >
        <!-- 播放模式切换 -->
        <button
          @click="handleTogglePlayMode"
          :disabled="!playerState.currentSong || songs.length <= 1"
          class="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 row-flex flex-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :title="playModeInfo.title"
        >
          <div :class="[playModeInfo.icon, 'text-lg text-zinc-700 dark:text-zinc-300']" />
        </button>

        <!-- 歌词切换按钮 -->
        <button
          @click="toggleLyrics()"
          :disabled="!playerState.currentSong"
          class="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 row-flex flex-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :title="showLyrics ? t('music_lyrics_hide') : t('music_lyrics_show')"
        >
          <div class="i-ic:baseline-lyrics text-lg text-zinc-700 dark:text-zinc-300" />
        </button>

        <!-- 音量控制 -->
        <VolumeControl />
      </div>
    </div>
  `
}
