// 菜单系统初始化

import { chatMenuProvider } from '../providers/ChatMenuProvider'
import { menuProviderManager } from './menuProviderManager'

// 初始化所有菜单提供者
export function initializeMenuProviders(): void {
  // 注册Chat应用菜单提供者
  menuProviderManager.registerProvider(chatMenuProvider)

  console.log('Menu providers initialized')
}

// 清理所有菜单提供者
export function cleanupMenuProviders(): void {
  menuProviderManager.dispose()
  console.log('Menu providers cleaned up')
}
