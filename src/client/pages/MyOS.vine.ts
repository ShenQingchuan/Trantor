import type { OpenWindowOptions } from '../types/windowManager'
import { DesktopBackground } from '../components/MyOS/DesktopBackground.vine'
import { Dock } from '../components/MyOS/Dock.vine'
import { LoginCard } from '../components/MyOS/LoginCard.vine'
import { StatusBar } from '../components/MyOS/StatusBar.vine'
import { DesktopWindowManager } from '../components/MyOS/WindowManager.vine'
import { useIsPhoneMode } from '../composables/useIsPhoneMode'
import { useAuthStore } from '../stores/authStore'
import { useStatusBarStore } from '../stores/statusBarStore'
import { useWindowStore } from '../stores/windowStore'

export function PageMyOS() {
  const authStore = useAuthStore()
  const windowStore = useWindowStore()
  const statusBarStore = useStatusBarStore()
  const isPhoneMode = useIsPhoneMode()
  const { t } = useI18n()

  // 初始化认证存储
  onMounted(async () => {
    await authStore.initialize()
  })

  // 监听窗口状态变化，更新状态栏的活跃应用
  watch(
    () => windowStore.getActiveWindow,
    (activeWindow) => {
      if (activeWindow) {
        statusBarStore.setActiveApp(activeWindow.appId)
      }
      else {
        statusBarStore.setActiveApp('system')
      }
    },
    { immediate: true },
  )

  // 处理应用点击 - 检查认证和权限
  const handleAppClick = (payload: OpenWindowOptions) => {
    if (!authStore.isAuthenticated) {
      // 未登录时不显示任何提示，因为已有登录界面
      return
    }

    const { appId, title } = payload
    if (appId && !authStore.canAccessApp(appId)) {
      // 显示权限错误提示
      console.error(`无权限访问 ${title}，请联系管理员`)
      return
    }

    // 打开对应应用窗口
    windowStore.openWindow({
      ...payload,
      initial: {
        width: 820,
        height: 520,
        x: 120,
        y: 100,
      },
    })
  }

  return vine`
    <div class="page-my-os col-flex w-full h-full flex-1 relative">
      <!-- 桌面背景 -->
      <DesktopBackground />

      <!-- macOS 风格状态栏 -->
      <StatusBar v-if="!isPhoneMode" />

      <!-- 主内容区域：桌面模式下需要留出状态栏空间 -->
      <div class="flex-1 col-flex w-full h-full relative" :class="{ 'pt-8': !isPhoneMode }">
        <!-- 未登录时的居中登录界面 -->
        <LoginCard v-if="!authStore.isAuthenticated" />

        <!-- 桌面模式：Dock + WindowManager -->
        <template v-else-if="!isPhoneMode">
          <Dock
            :isAuthenticated="authStore.isAuthenticated"
            :authStore="authStore"
            @appClick="handleAppClick"
          />
          <DesktopWindowManager />
        </template>

        <!-- 手机模式 -->
        <template v-else="authStore.isAuthenticated && isPhoneMode">
          <div v-motion-fade-visible class="col-flex flex-1 flex-center w-full h-full">
            <div class="col-flex flex-center gap-2 text-center flex-1">
              <div class="i-twemoji:building-construction text-8xl" />
              <div class="mt-4 text-2xl font-bold">{{ t('os_mobile_coming_soon') }}</div>
              <div class="text-xl text-zinc-500">{{ t('os_mobile_coming_soon_subtitle') }}</div>
            </div>
          </div>
        </template>
      </div>
    </div>
  `
}
