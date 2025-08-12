import { Dock } from '../components/MyOS/Dock.vine'
import { LoginCard } from '../components/MyOS/LoginCard.vine'
import { useAuthStore } from '../stores/authStore'

export function PageMyOS() {
  const authStore = useAuthStore()
  const { t } = useI18n()

  // 快速登录相关状态
  const loginPassword = ref('')
  const isQuickLoading = ref(false)
  const loginError = ref('')

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
      loginError.value = `无权限访问 ${appName}，请联系管理员`
      return
    }

    // 处理特定应用导航
    console.log(`Opening app: ${appId}`)
    // Todo: 在此添加实际的应用导航逻辑
  }

  // 快速登录处理
  const handleQuickLogin = async () => {
    if (!loginPassword.value.trim()) {
      loginError.value = t('auth_password_required')
      return
    }

    isQuickLoading.value = true
    loginError.value = ''

    try {
      // 使用owner用户名和密码登录
      await authStore.login({
        username: 'owner',
        password: loginPassword.value,
      })
      // 登录成功，清理状态
      loginPassword.value = ''
    }
    catch (error: any) {
      console.error('Login failed:', error)
      loginError.value = t('auth_password_error')
    }
    finally {
      isQuickLoading.value = false
    }
  }

  return vine`
    <div class="page-my-os col-flex flex-1 flex-center relative">
      <!-- 未登录时的居中登录界面 -->
      <LoginCard
        v-if="!authStore.isAuthenticated"
        :isQuickLoading="isQuickLoading"
        :loginError="loginError"
        v-model="loginPassword"
        @submit="handleQuickLogin"
      />

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
