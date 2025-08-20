import { useMusicStore } from '../../../stores/musicStore'
import { useWindowStore } from '../../../stores/windowStore'
import { MusicPlayer } from '../../Music/MusicPlayer.vine'
import { MusicSidebar } from '../../Music/MusicSidebar.vine'

// 侧边栏自动隐藏的宽度阈值
const SIDEBAR_AUTO_HIDE_THRESHOLD = 600

// 音乐应用窗口配置
export const musicAppWindowConfig = {
  initial: {
    width: 800,
    height: 550,
    x: 160,
    y: 120,
  },
  constraints: {
    minWidth: 300, // 配合侧边栏自动隐藏阈值
    minHeight: 400,
  },
}

export function MusicApp() {
  const musicStore = useMusicStore()
  const windowStore = useWindowStore()
  const showSidebar = ref(true)
  const autoHiddenSidebar = ref(false) // 标记是否是由于窗口宽度自动隐藏的侧边栏

  // 小窗口模式标识：当窗口宽度小于阈值时为小窗口模式
  const isSmallWindow = computed(() => {
    const windowWidth = currentMusicWindow.value?.width
    return windowWidth ? windowWidth < SIDEBAR_AUTO_HIDE_THRESHOLD : false
  })

  // 智能显示模式：在小窗口且侧边栏打开时，只显示歌单列表
  const showOnlyPlaylist = computed(() => {
    return isSmallWindow.value && showSidebar.value
  })

  // 初始化音频元素
  onMounted(() => {
    musicStore.initAudioElement()
  })

  // 监听音乐应用窗口的宽度变化
  const currentMusicWindow = computed(() => {
    return windowStore.windows.find(w => w.appId === 'music' && !w.isMinimized)
  })

  // 监听窗口宽度变化，自动管理侧边栏显示状态
  watch(
    () => currentMusicWindow.value?.width,
    (newWidth) => {
      if (!newWidth)
        return

      // 如果窗口宽度小于阈值，自动隐藏侧边栏
      if (newWidth < SIDEBAR_AUTO_HIDE_THRESHOLD) {
        if (showSidebar.value) {
          showSidebar.value = false
          autoHiddenSidebar.value = true // 标记是自动隐藏的
        }
      }
      // 如果窗口宽度大于阈值且之前是自动隐藏的，则自动显示侧边栏
      else if (autoHiddenSidebar.value) {
        showSidebar.value = true
        autoHiddenSidebar.value = false
      }
    },
    { immediate: true },
  )

  const toggleSidebar = () => {
    showSidebar.value = !showSidebar.value
    // 用户手动操作时，清除自动隐藏标记
    autoHiddenSidebar.value = false
  }

  // 处理歌曲选择：在小窗口模式下自动收起侧边栏显示播放界面
  const handleSongSelect = () => {
    if (isSmallWindow.value && showSidebar.value) {
      showSidebar.value = false
      autoHiddenSidebar.value = false // 用户操作触发，不是自动隐藏
    }
  }

  return vine`
    <div class="relative w-full h-full row-flex items-stretch bg-white dark:bg-zinc-950">
      <!-- 侧边栏 -->
      <div 
        v-if="showSidebar" 
        :class="[
          { 
            'flex-1 w-full': showOnlyPlaylist,
            'border-r border-zinc-200 dark:border-zinc-700': !showOnlyPlaylist
          }
        ]"
      >
        <MusicSidebar :fullscreen="showOnlyPlaylist" @songSelect="handleSongSelect" />
      </div>

      <!-- 主播放区域：在小窗口且侧边栏打开时隐藏 -->
      <div 
        v-if="!showOnlyPlaylist"
        class="flex-1 col-flex relative h-full"
      >
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
            <div class="text-sm text-zinc-600 dark:text-zinc-400">QQ音乐播放器</div>
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
