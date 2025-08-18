// 菜单提供者管理器

import type { CommandMenuGroup, MenuProvider } from '../types/menuSystem'
import { menuCommandRegistry } from './menuCommandRegistry'

class MenuProviderManager {
  private providers = new Map<string, MenuProvider>()

  // 注册菜单提供者
  registerProvider(provider: MenuProvider): void {
    const appId = provider.getAppId()

    if (this.providers.has(appId)) {
      // 先注销旧的命令
      const oldProvider = this.providers.get(appId)!
      oldProvider.unregisterCommands(menuCommandRegistry)
    }

    // 注册新的提供者和命令
    this.providers.set(appId, provider)
    provider.registerCommands(menuCommandRegistry)
  }

  // 注销菜单提供者
  unregisterProvider(appId: string): void {
    const provider = this.providers.get(appId)
    if (provider) {
      provider.unregisterCommands(menuCommandRegistry)
      this.providers.delete(appId)
    }
  }

  // 获取指定应用的菜单组
  getMenuGroups(appId: string): CommandMenuGroup[] {
    const provider = this.providers.get(appId)
    return provider?.getMenuGroups() || []
  }

  // 获取所有已注册的应用ID
  getRegisteredAppIds(): string[] {
    return Array.from(this.providers.keys())
  }

  // 检查应用是否已注册
  hasProvider(appId: string): boolean {
    return this.providers.has(appId)
  }

  // 清理所有提供者
  dispose(): void {
    for (const [_, provider] of this.providers) {
      provider.unregisterCommands(menuCommandRegistry)
    }
    this.providers.clear()
  }
}

// 导出单例
export const menuProviderManager = new MenuProviderManager()

// 导出类型，方便测试
export { MenuProviderManager }
