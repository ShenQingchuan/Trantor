import { useMusicStore } from '../../../stores/musicStore'
import { MusicPlayer } from '../../Music/MusicPlayer.vine'
import { MusicSidebar } from '../../Music/MusicSidebar.vine'

export function MusicApp() {
  const musicStore = useMusicStore()
  const showSidebar = ref(true)

  // 初始化音频元素
  onMounted(() => {
    musicStore.initAudioElement()
  })

  const toggleSidebar = () => {
    showSidebar.value = !showSidebar.value
  }

  return vine`
    <div class="relative w-full h-full row-flex items-stretch bg-white dark:bg-zinc-950">
      <!-- 侧边栏 -->
      <div v-if="showSidebar" class="border-r border-zinc-200 dark:border-zinc-700">
        <MusicSidebar />
      </div>

      <!-- 主播放区域 -->
      <div class="flex-1 col-flex relative h-full">
        <!-- 顶部工具栏 -->
        <div
          class="row-flex items-center justify-between p-3 border-b border-zinc-200/50 dark:border-zinc-700/50 bg-zinc-50/50 dark:bg-zinc-900/50"
        >
          <div class="row-flex items-center gap-3">
            <button
              @click="toggleSidebar"
              class="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
              title="切换歌单列表"
            >
              <div class="i-ic:menu text-lg text-zinc-600 dark:text-zinc-400" />
            </button>
            <div class="text-sm text-zinc-600 dark:text-zinc-400">音乐播放器</div>
          </div>
        </div>

        <!-- 播放器主界面 -->
        <div class="flex-1 w-full h-full">
          <MusicPlayer />
        </div>
      </div>
    </div>
  `
}
