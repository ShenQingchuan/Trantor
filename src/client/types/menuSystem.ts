// 菜单命令系统类型定义

// 重新导入statusBar类型，并扩展MenuItem支持命令
import type { StatusBarMenuGroup, StatusBarMenuItem } from './statusBar'

export interface MenuCommand {
  id: string
  appId: string
  payload?: any
}

export interface MenuCommandHandler {
  (command: MenuCommand): Promise<any> | any
}

export interface MenuCommandRegistry {
  register: (commandId: string, handler: MenuCommandHandler) => void
  unregister: (commandId: string) => void
  execute: (command: MenuCommand) => Promise<void> | void
  hasHandler: (commandId: string) => boolean
}

export interface MenuProvider {
  getAppId: () => string
  getMenuGroups: () => StatusBarMenuGroup[]
  registerCommands: (registry: MenuCommandRegistry) => void
  unregisterCommands: (registry: MenuCommandRegistry) => void
}

export interface CommandMenuItem extends Omit<StatusBarMenuItem, 'onClick'> {
  command?: string // 命令ID，替代onClick
  payload?: any // 命令参数
}

export interface CommandMenuGroup extends Omit<StatusBarMenuGroup, 'items'> {
  items: CommandMenuItem[]
}

export type { StatusBarMenuGroup, StatusBarMenuItem }
