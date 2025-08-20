import type { ReadonlyQQMusicSong } from '../../stores/musicStore'
import { formatDuration, getArtistNames } from '../../requests/music'
import { useMusicStore } from '../../stores/musicStore'

export function MusicSidebar(props?: {
  fullscreen?: boolean
}) {
  const emits = vineEmits<{
    songSelect: []
  }>()

  const musicStore = useMusicStore()
  const { playlist, songs, isLoadingPlaylist, playerState } = storeToRefs(musicStore)

  const handlePlaySong = (song: ReadonlyQQMusicSong) => {
    musicStore.playSong(song)
    // 在选择歌曲后触发事件
    emits('songSelect')
  }

  const isCurrentSong = (song: ReadonlyQQMusicSong) => {
    return playerState.value.currentSong?.songmid === song.songmid
  }

  // 处理图片加载失败
  const imageLoadError = ref(false)
  const handleImageError = () => {
    imageLoadError.value = true
  }

  // 当歌单变化时重置图片错误状态
  watch(() => playlist.value?.logo, () => {
    imageLoadError.value = false
  })

  return vine`
    <div
      :class="[
        'h-full bg-zinc-50 dark:bg-zinc-900 col-flex',
        fullscreen ? 'w-full' : 'min-w-280px border-r border-zinc-200 dark:border-zinc-700',
      ]"
    >
      <!-- 顶部标题栏 -->
      <div class="p-4 border-b border-zinc-200 dark:border-zinc-700">
        <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-200">我的歌单</h2>
      </div>

      <!-- 歌单信息 -->
      <div v-if="playlist" class="p-4 border-b border-zinc-200 dark:border-zinc-700">
        <div class="row-flex gap-3">
          <div
            class="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex-center"
          >
            <img
              v-if="playlist.logo && !imageLoadError"
              :src="playlist.logo"
              :alt="playlist.dissname"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
            <div
              v-if="!playlist.logo || imageLoadError"
              class="i-ic:library-music text-white text-2xl"
            />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
              {{ playlist.dissname || 'QQ音乐歌单' }}
            </h3>
            <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{{ songs.length }} 首歌曲</p>
          </div>
        </div>
      </div>

      <!-- 歌曲列表 -->
      <div class="flex-1 overflow-y-auto">
        <div
          v-if="isLoadingPlaylist"
          class="row-flex justify-center gap-2 p-4 text-center text-zinc-500"
        >
          <div class="i-svg-spinners:pulse-multiple" />
          <div class="text-sm">加载中...</div>
        </div>

        <div
          v-else-if="songs?.length === 0"
          class="row-flex justify-center gap-2 p-4 text-center text-zinc-500"
        >
          <div class="i-ic:music-note" />
          <div class="text-sm">暂无歌曲</div>
        </div>

        <div v-else class="p-2">
          <div
            v-for="(song, index) in songs"
            :key="song.songmid"
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
                  {{ song.songname }}
                </h3>
              </div>
              <div class="row-flex items-center gap-2 text-xs text-zinc-500">
                <span class="truncate">{{ getArtistNames(song.singer) }}</span>
                <span>·</span>
                <span>{{ song.albumname }}</span>
              </div>
            </div>

            <!-- 时长 -->
            <div class="text-xs text-zinc-400 tabular-nums">
              {{ formatDuration(song.interval) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}
