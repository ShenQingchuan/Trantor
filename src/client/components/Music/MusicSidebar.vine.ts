import type { ReadonlySong } from '../../stores/musicStore'
import { formatDuration } from '../../requests/music'
import { useMusicStore } from '../../stores/musicStore'

export function MusicSidebar() {
  const { t } = useI18n()
  const musicStore = useMusicStore()
  const { playlist, songs, isLoadingPlaylist, playerState } = storeToRefs(musicStore)

  const handlePlaySong = (song: ReadonlySong) => {
    musicStore.playSong(song)
  }

  const isCurrentSong = (song: ReadonlySong) => {
    return playerState.value.currentSong?.id === song.id
  }

  const handleRefreshPlaylist = () => {
    musicStore.refreshPlaylist()
  }

  return vine`
    <div
      class="min-w-280px h-full bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700 col-flex"
    >
      <!-- 顶部标题栏 -->
      <div
        class="row-flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700"
      >
        <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-200">我的歌单</h2>
        <button
          @click="handleRefreshPlaylist"
          :disabled="isLoadingPlaylist"
          class="row-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:opacity-50"
        >
          <div class="i-ic:refresh text-sm" />
          {{ t('music_refresh_list') }}
        </button>
      </div>

      <!-- 歌单信息 -->
      <div v-if="playlist" class="p-4 border-b border-zinc-200 dark:border-zinc-700">
        <div class="row-flex gap-3">
          <img
            :src="playlist.coverImgUrl"
            :alt="playlist.name"
            class="w-16 h-16 rounded-lg object-cover"
          />
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
              {{ playlist.name }}
            </h3>
            <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {{ t('music_songs_count', { count: playlist.trackCount }) }}
            </p>
          </div>
        </div>
        <p
          v-if="playlist.description"
          class="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2"
        >
          {{ playlist.description }}
        </p>
      </div>

      <!-- 歌曲列表 -->
      <div class="flex-1 overflow-y-auto">
        <div
          v-if="isLoadingPlaylist"
          class="row-flex justify-center gap-2 p-4 text-center text-zinc-500"
        >
          <div class="i-svg-spinners:pulse-multiple" />
          <div class="text-sm">{{ t('os_common_loading') }}</div>
        </div>

        <div
          v-else-if="songs?.length === 0"
          class="row-flex justify-center gap-2 p-4 text-center text-zinc-500"
        >
          <div class="i-ic:music-note" />
          <div class="text-sm">{{ t('music_no_songs') }}</div>
        </div>

        <div v-else class="p-2">
          <div
            v-for="(song, index) in songs"
            :key="song.id"
            @click="handlePlaySong(song)"
            class="group row-flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            :class="[
              isCurrentSong(song)
                ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                : 'border border-transparent',
            ]"
          >
            <!-- 序号/播放图标 -->
            <div class="w-8 text-center">
              <div
                v-if="isCurrentSong(song) && playerState.isPlaying"
                class="i-ic:pause text-blue-500"
              />
              <div v-else-if="isCurrentSong(song)" class="i-ic:play-arrow text-blue-500" />
              <span v-else class="text-sm text-zinc-400 group-hover:hidden">
                {{ index + 1 }}
              </span>
              <div
                v-if="!isCurrentSong(song)"
                class="i-ic:play-arrow text-zinc-400 hidden group-hover:block"
              />
            </div>

            <!-- 歌曲信息 -->
            <div class="flex-1 min-w-0">
              <div class="row-flex items-center gap-2 mb-1">
                <h3 class="font-medium text-zinc-800 dark:text-zinc-200 truncate text-sm">
                  {{ song.name }}
                </h3>
              </div>
              <div class="row-flex items-center gap-2 text-xs text-zinc-500">
                <span class="truncate">{{ song.ar.map((artist) => artist.name).join(', ') }}</span>
                <span>·</span>
                <span>{{ song.al.name }}</span>
              </div>
            </div>

            <!-- 时长 -->
            <div class="text-xs text-zinc-400 tabular-nums">
              {{ formatDuration(song.dt) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}
