import { Dock } from '../components/MyOS/Dock.vine'
import { LoginCard } from '../components/MyOS/LoginCard.vine'
import { useAuthStore } from '../stores/authStore'

export function PageMyOS() {
  const authStore = useAuthStore()

  // 初始化认证存储
  onMounted(async () => {
    await authStore.initialize()
  })

  // 处理应用点击 - 检查认证和权限
  const handleAppClick = (appId: string, appName: string) => {
    if (!authStore.isAuthenticated) {
      // 未登录时不显示任何提示，因为已有登录界面
      return
    }

    if (!authStore.canAccessApp(appId)) {
      // 显示权限错误提示
      console.error(`无权限访问 ${appName}，请联系管理员`)
      return
    }

    // 处理特定应用导航
    console.log(`Opening app: ${appId}`)
    // Todo: 在此添加实际的应用导航逻辑
  }

  return vine`
    <div class="page-my-os col-flex flex-1 flex-center relative">
      <!-- 未登录时的居中登录界面 -->
      <LoginCard v-if="!authStore.isAuthenticated" />

      <!-- Dock 应用栏 -->
      <Dock
        v-if="authStore.isAuthenticated"
        :isAuthenticated="authStore.isAuthenticated"
        :authStore="authStore"
        @appClick="handleAppClick"
      />
    </div>
  `
}
