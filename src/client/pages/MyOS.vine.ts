import type { OpenWindowOptions } from '../types/windowManager'
import { Dock } from '../components/MyOS/Dock.vine'
import { LoginCard } from '../components/MyOS/LoginCard.vine'
import { DesktopWindowManager } from '../components/MyOS/WindowManager.vine'
import { useIsPhoneMode } from '../composables/useIsPhoneMode'
import { useAuthStore } from '../stores/authStore'
import { useWindowStore } from '../stores/windowStore'

export function PageMyOS() {
  const authStore = useAuthStore()
  const windowStore = useWindowStore()
  const isPhoneMode = useIsPhoneMode()
  const { t } = useI18n()

  // 初始化认证存储
  onMounted(async () => {
    await authStore.initialize()
  })

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
    <div class="page-my-os col-flex flex-1 flex-center relative">
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

      <!-- 手机模式：移动端启动器（九宫格）+ 全屏应用 -->
      <template v-else="authStore.isAuthenticated && isPhoneMode">
        <div v-motion-fade-visible class="col-flex flex-center wh-full">
          <div class="col-flex flex-center gap-2 text-center">
            <div class="i-twemoji:building-construction text-8xl" />
            <div class="mt-4 text-2xl font-bold">{{ t('os_mobile_coming_soon') }}</div>
            <div class="text-xl text-zinc-500">{{ t('os_mobile_coming_soon_subtitle') }}</div>
          </div>
        </div>
      </template>
    </div>
  `
}
