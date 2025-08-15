import type { StatusBarMenuItem } from '../../types/statusBar'
import { useStatusBarStore } from '../../stores/statusBarStore'

// 菜单项组件
function StatusBarMenuDropdown(props: {
  title: string
  items: StatusBarMenuItem[]
  isOpen: boolean
}) {
  return vine`
    <div class="relative">
      <!-- 菜单触发器 -->
      <button
        class="px-3 py-1 text-sm text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
        :class="{ 'bg-zinc-200 dark:bg-zinc-700': isOpen }"
      >
        {{ title }}
      </button>

      <!-- 下拉菜单 -->
      <div
        v-show="isOpen"
        class="absolute top-full left-0 mt-1 p-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-lg min-w-200px z-50"
      >
        <template v-for="item in items" :key="item.id">
          <!-- 分隔符 -->
          <div v-if="item.separator" class="h-px bg-zinc-200 dark:bg-zinc-700 my-1" />

          <!-- 普通菜单项 -->
          <button
            v-else
            @click="item.onClick?.()"
            :disabled="item.disabled"
            class="w-full px-4 py-2 text-left text-sm text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors row-flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div class="row-flex items-center gap-2">
              <div v-if="item.icon" :class="item.icon" />
              <span>{{ item.label }}</span>
            </div>
            <span v-if="item.shortcut" class="text-xs text-zinc-500 font-mono">{{
              item.shortcut
            }}</span>
          </button>
        </template>
      </div>
    </div>
  `
}

// 托盘图标组件
function StatusBarTrayIcon(props: {
  icon: import('../../types/statusBar').StatusBarTrayIcon
}) {
  const showTooltip = ref(false)

  return vine`
    <div class="relative">
      <!-- 托盘图标按钮 -->
      <button
        @click="icon.onClick?.()"
        @mouseenter="showTooltip = true"
        @mouseleave="showTooltip = false"
        class="w-8 h-8 row-flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors relative"
      >
        <div :class="icon.icon" class="text-lg" />
        <!-- 徽章 -->
        <div
          v-if="icon.badge"
          class="absolute -top-1 -right-1 min-w-4 h-4 bg-red-500 text-white text-xs rounded-full row-flex items-center justify-center px-1"
        >
          {{ icon.badge }}
        </div>
      </button>

      <!-- 工具提示 -->
      <div
        v-show="showTooltip && icon.tooltip"
        class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded whitespace-nowrap z-50"
      >
        {{ icon.tooltip }}
        <!-- 小箭头 -->
        <div
          class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-800"
        />
      </div>
    </div>
  `
}

// 状态栏时钟组件
function StatusBarClock() {
  const statusBarStore = useStatusBarStore()
  const { formattedTime } = storeToRefs(statusBarStore)

  return vine`
    <div
      v-if="statusBarStore.clockConfig.visible"
      class="px-3 py-1 text-sm text-zinc-800 dark:text-zinc-200 cursor-default select-none"
    >
      {{ formattedTime }}
    </div>
  `
}

// 主状态栏组件
export function StatusBar() {
  const statusBarStore = useStatusBarStore()
  const { visible, height, currentAppMenus, visibleTrayIcons } = storeToRefs(statusBarStore)

  const openMenus = ref<Set<string>>(new Set())
  const heightStyle = computed(() => `${height.value}px`)

  const toggleMenu = (menuId: string) => {
    const newOpenMenus = new Set(openMenus.value)
    if (newOpenMenus.has(menuId)) {
      newOpenMenus.delete(menuId)
    }
    else {
      newOpenMenus.clear() // 只允许一个菜单打开
      newOpenMenus.add(menuId)
    }
    openMenus.value = newOpenMenus
  }

  const closeAllMenus = () => {
    openMenus.value.clear()
  }

  const onMenuItemClick = (item: StatusBarMenuItem) => {
    item.onClick?.()
    closeAllMenus()
  }

  // 点击外部区域关闭菜单
  onMounted(() => {
    document.addEventListener('click', closeAllMenus)
  })

  onUnmounted(() => {
    document.removeEventListener('click', closeAllMenus)
  })

  vineStyle.scoped(`
    .status-bar {
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      background: rgba(255, 255, 255, 0.8);
    }
    .dark .status-bar {
      background: rgba(24, 24, 27, 0.8);
    }
  `)

  return vine`
    <div
      v-if="visible"
      class="status-bar fixed top-0 left-0 right-0 border-b border-zinc-200 dark:border-zinc-700 row-flex items-center justify-between px-4 z-50"
      :style="{ height: heightStyle }"
      @click.stop
    >
      <!-- 左侧：系统图标菜单 + 应用菜单 -->
      <div class="row-flex items-center gap-2">
        <!-- 系统图标菜单 -->
        <div class="relative">
          <button
            @click="toggleMenu('system-menu')"
            class="w-8 h-8 row-flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
            :class="{ 'bg-zinc-200 dark:bg-zinc-700': openMenus.has('system-menu') }"
          >
            <div class="i-hugeicons:alien-02 text-xl" />
          </button>

          <!-- 系统菜单下拉 -->
          <div
            v-show="openMenus.has('system-menu')"
            class="absolute top-full left-0 mt-1 p-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-lg min-w-200px z-50"
          >
            <template v-for="item in statusBarStore.appMenus.system || []" :key="item.id">
              <!-- 分隔符 -->
              <div v-if="item.separator" class="h-px bg-zinc-200 dark:bg-zinc-700 my-1" />

              <!-- 普通菜单项 -->
              <button
                v-else
                @click="onMenuItemClick(item)"
                :disabled="item.disabled"
                class="w-full px-4 py-2 text-left text-sm text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors row-flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div class="row-flex items-center gap-2">
                  <div v-if="item.icon" :class="item.icon" />
                  <span>{{ item.label }}</span>
                </div>
                <span v-if="item.shortcut" class="text-zinc-500 font-mono">{{ item.shortcut }}</span>
              </button>
            </template>
          </div>
        </div>

        <!-- 当前应用菜单 -->
        <div class="row-flex items-center">
          <StatusBarMenuDropdown
            v-if="currentAppMenus.length > 0 && statusBarStore.activeAppId !== 'system'"
            :title="statusBarStore.activeAppId"
            :items="currentAppMenus"
            :isOpen="openMenus.has('app-menu')"
            @click="toggleMenu('app-menu')"
          />
        </div>
      </div>

      <!-- 右侧：托盘图标 + 时钟 -->
      <div class="row-flex items-center gap-2">
        <!-- 托盘图标 -->
        <div class="row-flex items-center gap-1">
          <StatusBarTrayIcon
            v-for="trayIcon in visibleTrayIcons"
            :key="trayIcon.id"
            :icon="trayIcon"
          />
        </div>

        <!-- 时钟 -->
        <StatusBarClock />
      </div>
    </div>
  `
}
