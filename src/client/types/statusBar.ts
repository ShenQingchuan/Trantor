export interface StatusBarMenuItem {
  id: string
  label?: string
  shortcut?: string
  icon?: string
  disabled?: boolean
  children?: StatusBarMenuItem[]
  separator?: true
  onClick?: () => void
}

export interface StatusBarAppMenus {
  [appId: string]: StatusBarMenuItem[]
}

// 分散式菜单项 - 支持多个独立的菜单
export interface StatusBarMenuGroup {
  id: string
  title: string
  items: StatusBarMenuItem[]
  visible?: boolean
  order?: number
}

export interface StatusBarAppMenuGroups {
  [appId: string]: StatusBarMenuGroup[]
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
