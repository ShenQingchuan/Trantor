// Chat 应用菜单提供者

import type { CommandMenuGroup, MenuCommand, MenuCommandRegistry, MenuProvider } from '../types/menuSystem'
import { useI18n } from 'vue-i18n'

export class ChatMenuProvider implements MenuProvider {
  private readonly appId = 'chat'

  getAppId(): string {
    return this.appId
  }

  getMenuGroups(): CommandMenuGroup[] {
    const { t } = useI18n()

    return [
      {
        id: 'session',
        title: t('chat_menu_session'),
        order: 1,
        items: [
          { id: 'new-chat', label: t('chat_session_new'), command: 'chat.session.new', shortcut: '⌘N', icon: 'i-lucide:plus' },
          { id: 'open-chat', label: t('chat_session_open'), command: 'chat.session.open', shortcut: '⌘O', icon: 'i-lucide:folder-open' },
          { id: 'sep1', separator: true },
          { id: 'save-chat', label: t('chat_session_save'), command: 'chat.session.save', shortcut: '⌘S', icon: 'i-lucide:save' },
          { id: 'save-as-chat', label: t('chat_session_save_as'), command: 'chat.session.saveAs', shortcut: '⇧⌘S', icon: 'i-lucide:save' },
          { id: 'sep2', separator: true },
          { id: 'close-chat', label: t('chat_session_close'), command: 'chat.session.close', shortcut: '⌘W', icon: 'i-lucide:x' },
        ],
      },
    ]
  }

  registerCommands(registry: MenuCommandRegistry): void {
    // 会话命令
    registry.register('chat.session.new', this.handleNewChat.bind(this))
    registry.register('chat.session.open', this.handleOpenChat.bind(this))
    registry.register('chat.session.save', this.handleSaveChat.bind(this))
    registry.register('chat.session.saveAs', this.handleSaveAsChat.bind(this))
    registry.register('chat.session.close', this.handleCloseChat.bind(this))
  }

  unregisterCommands(registry: MenuCommandRegistry): void {
    // 注销所有命令
    const commands = [
      'chat.session.new',
      'chat.session.open',
      'chat.session.save',
      'chat.session.saveAs',
      'chat.session.close',
    ]

    commands.forEach(cmd => registry.unregister(cmd))
  }

  // === 会话命令处理器 ===
  private async handleNewChat(_: MenuCommand): Promise<void> {
    console.log('Chat: New chat session')
    // Todo: 实现新建对话逻辑
  }

  private async handleOpenChat(_: MenuCommand): Promise<void> {
    console.log('Chat: Open chat session')
    // Todo: 实现打开对话逻辑
  }

  private async handleSaveChat(_: MenuCommand): Promise<void> {
    console.log('Chat: Save chat session')
    // Todo: 实现保存对话逻辑
  }

  private async handleSaveAsChat(_: MenuCommand): Promise<void> {
    console.log('Chat: Save chat session as...')
    // Todo: 实现另存为对话逻辑
  }

  private async handleCloseChat(_: MenuCommand): Promise<void> {
    console.log('Chat: Close chat session')
    // Todo: 实现关闭对话逻辑
  }
}

// 导出单例实例
export const chatMenuProvider = new ChatMenuProvider()
