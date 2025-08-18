// Chat 应用菜单提供者

import type { CommandMenuGroup, MenuCommandRegistry, MenuProvider } from '../types/menuSystem'

export class ChatMenuProvider implements MenuProvider {
  private readonly appId = 'chat'

  getAppId(): string {
    return this.appId
  }

  getMenuGroups(): CommandMenuGroup[] {
    // 使用固定的 key，翻译将在 StatusBar 组件中处理
    return [
      {
        id: 'session',
        title: 'chat_menu_session',
        order: 1,
        items: [
          { id: 'new-chat', label: 'chat_session_new', command: 'chat.session.new', icon: 'i-lucide:plus' },
          { id: 'edit-title', label: 'chat_session__edit_title', command: 'chat.session.editTitle', icon: 'i-lucide:edit' },
          { id: 'delete-session', label: 'chat_session__delete', command: 'chat.session.delete', icon: 'i-lucide:trash-2' },
          { id: 'sep3', separator: true },
          { id: 'clear-messages', label: 'chat_edit_clear_history', command: 'chat.session.clearHistory', icon: 'i-lucide:eraser' },
        ],
      },
      {
        id: 'view',
        title: 'chat_menu_view',
        order: 3,
        items: [
          { id: 'toggle-sidebar', label: 'chat_view_toggle_sidebar', command: 'chat.view.toggleSidebar', icon: 'i-lucide:sidebar' },
        ],
      },
    ]
  }

  registerCommands(registry: MenuCommandRegistry): void {
    // 会话命令 - 现在只注册命令ID，实际处理将通过事件系统
    registry.register('chat.session.new', () => window.dispatchEvent(new CustomEvent('chat:newSession')))
    registry.register('chat.session.editTitle', () => window.dispatchEvent(new CustomEvent('chat:editTitle')))
    registry.register('chat.session.delete', () => window.dispatchEvent(new CustomEvent('chat:deleteSession')))
    registry.register('chat.session.clearHistory', () => window.dispatchEvent(new CustomEvent('chat:clearHistory')))
    registry.register('chat.view.toggleSidebar', () => window.dispatchEvent(new CustomEvent('chat:toggleSidebar')))
  }

  unregisterCommands(registry: MenuCommandRegistry): void {
    // 注销所有命令
    const commands = [
      'chat.session.new',
      'chat.session.editTitle',
      'chat.session.delete',
      'chat.session.clearHistory',
      'chat.view.toggleSidebar',
    ]

    commands.forEach(cmd => registry.unregister(cmd))
  }
}

// 导出单例实例
export const chatMenuProvider = new ChatMenuProvider()
