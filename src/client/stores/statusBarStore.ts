import type { MenuCommand } from '../types/menuSystem'
import type { StatusBarAppMenuGroups, StatusBarAppMenus, StatusBarClockConfig, StatusBarMenuItem, StatusBarTrayIcon } from '../types/statusBar'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useRouter } from 'vue-router'
import { menuCommandRegistry } from '../services/menuCommandRegistry'
import { menuProviderManager } from '../services/menuProviderManager'

const statusBarStoreId = 'trantor:status-bar-store' as const

export const useStatusBarStore = defineStore(statusBarStoreId, () => {
  const router = useRouter()
  const { t } = useI18n()

  // 基本配置状态
  const visible = ref(true)
  const height = ref(32)

  // 应用菜单
  const appMenus = ref<StatusBarAppMenus>({})

  // 分散式应用菜单组
  const appMenuGroups = ref<StatusBarAppMenuGroups>({})

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

  // 当前活跃应用的菜单组 - 使用新的提供者系统
  const currentAppMenuGroups = computed(() => {
    const groups = menuProviderManager.getMenuGroups(activeAppId.value)
    return groups
      .filter(group => group.visible !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
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

  // 设置应用菜单组
  const setAppMenuGroups = (appId: string, groups: import('../types/statusBar').StatusBarMenuGroup[]) => {
    appMenuGroups.value[appId] = groups
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

  // 执行菜单命令
  const executeCommand = async (commandId: string, payload?: any) => {
    const command: MenuCommand = {
      id: commandId,
      appId: activeAppId.value,
      payload,
    }

    try {
      await menuCommandRegistry.execute(command)
    }
    catch (error) {
      console.error('Failed to execute menu command:', error)
    }
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
      { id: 'about', icon: 'i-mdi:information-outline', label: t('os_menu_about') },
      { id: 'back-to-blog', icon: 'i-material-symbols:back-to-tab-rounded', label: t('os_menu_back_to_blog'), onClick: () => router.push('/') },
    ])

    // 菜单配置由各应用的 MenuProvider 负责，此处不再硬编码

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
    appMenuGroups,
    trayIcons,
    clockConfig,
    activeAppId,
    currentTime,
    formattedTime,
    currentAppMenus,
    currentAppMenuGroups,
    visibleTrayIcons,

    // 方法
    initialize,
    setVisible,
    setAppMenus,
    setAppMenuGroups,
    setActiveApp,
    registerTrayIcon,
    unregisterTrayIcon,
    updateTrayIcon,
    setClockConfig,
    executeCommand,
    dispose,
  }
})
