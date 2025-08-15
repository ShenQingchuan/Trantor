export interface StatusBarMenuItem {
  id: string
  label?: string
  shortcut?: string
  icon?: string
  disabled?: boolean
  separator?: boolean
  children?: StatusBarMenuItem[]
  onClick?: () => void
}

export interface StatusBarAppMenus {
  [appId: string]: StatusBarMenuItem[]
}

export interface StatusBarTrayIcon {
  id: string
  icon: string
  tooltip?: string
  visible?: boolean
  badge?: string | number
  menu?: StatusBarMenuItem[]
  onClick?: () => void
}

export interface StatusBarClockConfig {
  format?: string
  visible?: boolean
  onClick?: () => void
}

export interface StatusBarConfig {
  // 左侧：应用菜单
  appMenus: StatusBarAppMenus
  // 右侧：托盘图标
  trayIcons: StatusBarTrayIcon[]
  // 右侧：时钟配置
  clock: StatusBarClockConfig
  // 全局设置
  visible: boolean
  height: number
}

// 状态栏动作类型
export type StatusBarAction
  = | { type: 'SET_VISIBLE', visible: boolean }
    | { type: 'SET_APP_MENUS', appId: string, menus: StatusBarMenuItem[] }
    | { type: 'REGISTER_TRAY_ICON', icon: StatusBarTrayIcon }
    | { type: 'UNREGISTER_TRAY_ICON', id: string }
    | { type: 'UPDATE_TRAY_ICON', id: string, updates: Partial<StatusBarTrayIcon> }
    | { type: 'SET_CLOCK_CONFIG', config: Partial<StatusBarClockConfig> }

// 默认应用菜单
export const defaultAppMenus: StatusBarAppMenus = {
  system: [
    {
      id: 'about',
      label: '关于 MyOS',
      onClick: () => console.log('About MyOS'),
    },
    {
      id: 'preferences',
      label: '系统偏好设置',
      onClick: () => console.log('System Preferences'),
    },
    { id: 'sep1', separator: true },
    {
      id: 'sleep',
      label: '休眠',
      onClick: () => console.log('Sleep'),
    },
  ],
  chat: [
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
  ],
}

// 默认托盘图标
export const defaultTrayIcons: StatusBarTrayIcon[] = [
  {
    id: 'back-to-blog',
    icon: 'i-material-symbols:back-to-tab-rounded',
    tooltip: '返回博客',
    visible: true,
    onClick: () => {
      // 这里会在实际组件中替换为路由跳转
      console.log('Navigate to blog')
    },
  },
]
