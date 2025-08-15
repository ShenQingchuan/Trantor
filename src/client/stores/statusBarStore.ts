import type { StatusBarAppMenus, StatusBarClockConfig, StatusBarMenuItem, StatusBarTrayIcon } from '../types/statusBar'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useRouter } from 'vue-router'

const statusBarStoreId = 'trantor:status-bar-store' as const

export const useStatusBarStore = defineStore(statusBarStoreId, () => {
  const router = useRouter()

  // 基本配置状态
  const visible = ref(true)
  const height = ref(32) // macOS 状态栏标准高度

  // 应用菜单
  const appMenus = ref<StatusBarAppMenus>({})

  // 托盘图标
  const trayIcons = ref<StatusBarTrayIcon[]>([])

  // 时钟配置
  const clockConfig = ref<StatusBarClockConfig>({
    format: 'M月d日 EEEE HH:mm',
    visible: true,
  })

  // 当前激活的应用 ID（用于显示对应的应用菜单）
  const activeAppId = ref<string>('system')

  // 当前时间
  const currentTime = ref(new Date())

  // 格式化的时间字符串
  const formattedTime = computed(() => {
    if (!clockConfig.value.visible || !clockConfig.value.format)
      return ''
    return format(currentTime.value, clockConfig.value.format, { locale: zhCN })
  })

  // 当前活跃应用的菜单
  const currentAppMenus = computed(() => {
    return appMenus.value[activeAppId.value] || []
  })

  // 可见的托盘图标
  const visibleTrayIcons = computed(() => {
    return trayIcons.value.filter(icon => icon.visible !== false)
  })

  // 更新时间的定时器
  let timeInterval: number | null = null

  // 停止时间更新器
  const stopTimeUpdater = () => {
    if (timeInterval) {
      clearInterval(timeInterval)
      timeInterval = null
    }
  }

  // 设置可见性
  const setVisible = (newVisible: boolean) => {
    visible.value = newVisible
  }

  // 设置应用菜单
  const setAppMenus = (appId: string, menus: StatusBarMenuItem[]) => {
    appMenus.value[appId] = menus
  }

  // 设置当前激活的应用
  const setActiveApp = (appId: string) => {
    activeAppId.value = appId
  }

  // 注册托盘图标
  const registerTrayIcon = (icon: StatusBarTrayIcon) => {
    // 如果已存在相同 ID 的图标，则更新
    const existingIndex = trayIcons.value.findIndex(item => item.id === icon.id)
    if (existingIndex >= 0) {
      trayIcons.value[existingIndex] = icon
    }
    else {
      trayIcons.value.push(icon)
    }
  }

  // 注销托盘图标
  const unregisterTrayIcon = (id: string) => {
    const index = trayIcons.value.findIndex(icon => icon.id === id)
    if (index >= 0) {
      trayIcons.value.splice(index, 1)
    }
  }

  // 更新托盘图标
  const updateTrayIcon = (id: string, updates: Partial<StatusBarTrayIcon>) => {
    const icon = trayIcons.value.find(item => item.id === id)
    if (icon) {
      Object.assign(icon, updates)
    }
  }

  // 设置时钟配置
  const setClockConfig = (config: Partial<StatusBarClockConfig>) => {
    Object.assign(clockConfig.value, config)
  }

  // 清理
  const dispose = () => {
    stopTimeUpdater()
  }

  // 启动时间更新器
  const startTimeUpdater = () => {
    if (timeInterval)
      return

    // 立即更新一次
    currentTime.value = new Date()

    // 每秒更新时间
    timeInterval = window.setInterval(() => {
      currentTime.value = new Date()
    }, 1000)
  }

  // 初始化
  const initialize = () => {
    // 设置默认应用菜单
    setAppMenus('system', [
      {
        id: 'about',
        label: '关于 MyOS',
        onClick: () => console.log('About MyOS'),
      },
      {
        id: 'preferences',
        label: '系统偏好设置...',
        shortcut: '⌘,',
        onClick: () => console.log('System Preferences'),
      },
      { id: 'sep1', separator: true },
      {
        id: 'sleep',
        label: '休眠',
        onClick: () => console.log('Sleep'),
      },
    ])

    setAppMenus('chat', [
      {
        id: 'new-chat',
        label: '新建对话',
        shortcut: '⌘N',
        icon: 'i-lucide:plus',
      },
      {
        id: 'save-chat',
        label: '保存对话',
        shortcut: '⌘S',
        icon: 'i-lucide:save',
      },
      { id: 'sep1', separator: true },
      {
        id: 'clear-history',
        label: '清空历史',
        icon: 'i-lucide:trash-2',
      },
    ])

    // 注册默认托盘图标
    registerTrayIcon({
      id: 'back-to-blog',
      icon: 'i-material-symbols:back-to-tab-rounded',
      tooltip: '返回博客',
      visible: true,
      onClick: () => {
        router.push('/')
      },
    })

    // 启动时间更新器
    startTimeUpdater()
  }

  // 初始化
  onMounted(initialize)
  onUnmounted(dispose)

  return {
    // 状态
    visible,
    height,
    appMenus,
    trayIcons,
    clockConfig,
    activeAppId,
    currentTime,
    formattedTime,
    currentAppMenus,
    visibleTrayIcons,

    // 方法
    initialize,
    setVisible,
    setAppMenus,
    setActiveApp,
    registerTrayIcon,
    unregisterTrayIcon,
    updateTrayIcon,
    setClockConfig,
    dispose,
  }
})
