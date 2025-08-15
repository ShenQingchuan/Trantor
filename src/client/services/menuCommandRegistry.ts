// 菜单命令注册中心

import type { MenuCommand, MenuCommandHandler, MenuCommandRegistry } from '../types/menuSystem'

class MenuCommandRegistryImpl implements MenuCommandRegistry {
  private handlers = new Map<string, MenuCommandHandler>()

  register(commandId: string, handler: MenuCommandHandler): void {
    if (this.handlers.has(commandId)) {
      console.warn(`Command '${commandId}' is already registered. Overwriting previous handler.`)
    }
    this.handlers.set(commandId, handler)
  }

  unregister(commandId: string): void {
    this.handlers.delete(commandId)
  }

  hasHandler(commandId: string): boolean {
    return this.handlers.has(commandId)
  }

  async execute(command: MenuCommand): Promise<void> {
    const handler = this.handlers.get(command.id)

    if (!handler) {
      console.error(`No handler registered for command: ${command.id}`)
      return
    }

    try {
      await handler(command)
    }
    catch (error) {
      console.error(`Error executing command '${command.id}':`, error)
      throw error
    }
  }
}

// 创建全局单例
export const menuCommandRegistry = new MenuCommandRegistryImpl()

// 导出类型，方便测试时创建新实例
export { MenuCommandRegistryImpl }
