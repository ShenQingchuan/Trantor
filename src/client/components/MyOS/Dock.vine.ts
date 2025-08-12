import { AppIcon } from './AppIcon.vine'

interface DockProps {
  isAuthenticated: boolean
  authStore: any
}

export function Dock(props: DockProps) {
  const emits = vineEmits<{
    appClick: [appId: string, appName: string]
  }>()

  const handleAppClick = (appId: string, appName: string) => {
    emits('appClick', appId, appName)
  }

  return vine`
    <div
      class="dock absolute bottom-4 py-2 px-6 rounded z-10 bg-slate-300/40 dark:bg-dark-200/60 backdrop-blur-md backdrop-saturate-150 shadow-lg"
    >
      <div class="relative row-flex gap-4 items-end">
        <!-- Finder 应用 -->
        <AppIcon
          appId="finder"
          appName="Finder"
          iconClass="i-ri:finder-fill"
          :isAuthenticated="isAuthenticated"
          :canAccess="authStore.canAccessApp('finder')"
          @start-app="handleAppClick"
        />

        <!-- 聊天应用 -->
        <AppIcon
          appId="chat"
          appName="AI Chat"
          iconClass="i-ph:wechat-logo-duotone"
          :isAuthenticated="isAuthenticated"
          :canAccess="authStore.canAccessApp('chat')"
          @start-app="handleAppClick"
        />

        <!-- 日历应用 -->
        <AppIcon
          appId="calendar"
          appName="Calendar"
          iconClass="i-ph:calendar-dots-fill"
          :isAuthenticated="isAuthenticated"
          :canAccess="authStore.canAccessApp('calendar')"
          @start-app="handleAppClick"
        />
      </div>
    </div>
  `
}
