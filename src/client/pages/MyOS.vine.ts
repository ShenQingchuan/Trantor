import { useMessage } from 'naive-ui'
import { useAuthStore } from '../stores/authStore'

export function PageMyOS() {
  const authStore = useAuthStore()
  const message = useMessage()
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
      message.error(`无权限访问 ${appName}，请联系管理员`)
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
      loginError.value = error.message || t('auth_password_error')
    }
    finally {
      isQuickLoading.value = false
    }
  }

  return vine`
    <div class="page-my-os col-flex flex-1 flex-center relative">
      <!-- 未登录时的居中登录界面 -->
      <div
        v-if="!authStore.isAuthenticated"
        class="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900"
      >
        <!-- 登录卡片 -->
        <div
          class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-96 max-w-[90vw] shadow-2xl border border-white/20"
        >
          <!-- 系统标题 -->
          <div class="text-center mb-8">
            <div
              class="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center"
            >
              <div class="i-ri:computer-line text-4xl text-white" />
            </div>
            <h1 class="text-2xl font-light text-white mb-2">{{ t('os_login_title') }}</h1>
            <p class="text-sm text-white/80">{{ t('os_password_prompt') }}</p>
          </div>

          <!-- 密码输入 -->
          <form @submit.prevent="handleQuickLogin" class="space-y-4">
            <div class="relative">
              <input
                v-model="loginPassword"
                type="password"
                autocomplete="current-password"
                :placeholder="t('auth_password_placeholder')"
                class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent backdrop-blur-sm"
              />
              <div v-if="loginError" class="absolute -bottom-6 left-0 text-xs text-red-300">
                {{ loginError }}
              </div>
            </div>

            <button
              type="submit"
              :disabled="isQuickLoading || !loginPassword.trim()"
              class="w-full py-3 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-sm border border-white/20"
            >
              <div v-if="isQuickLoading" class="i-ri:loader-4-line animate-spin" />
              {{ isQuickLoading ? t('os_validating') : t('common_login') }}
            </button>
          </form>
        </div>
      </div>

      <!-- 主要应用坞 -->
      <div
        v-if="authStore.isAuthenticated"
        class="dock absolute bottom-4 py-2 px-6 rounded z-10 bg-dark-200/60 backdrop-blur-md backdrop-saturate-150 shadow-lg"
      >
        <div class="relative row-flex gap-4 items-end">
          <!-- Finder 应用 -->
          <div
            class="i-ri:finder-fill text-5xl flex-center h-14 relative origin-bottom group cursor-pointer transition-transform duration-200 hover:scale-160 group-hover:scale-130"
            @click="handleAppClick('finder', 'Finder')"
            :class="{ 'opacity-50': authStore.isAuthenticated && !authStore.canAccessApp('finder') }"
          />

          <!-- 聊天应用 -->
          <div
            class="i-ph:wechat-logo-duotone text-5xl flex-center h-14 relative origin-bottom group cursor-pointer transition-transform duration-200 hover:scale-160 group-hover:scale-130"
            @click="handleAppClick('chat', 'AI Chat')"
            :class="{ 'opacity-50': authStore.isAuthenticated && !authStore.canAccessApp('chat') }"
          />

          <!-- 日历应用 -->
          <div
            class="i-ph:calendar-dots-fill text-5xl flex-center h-14 relative origin-bottom group cursor-pointer transition-transform duration-200 hover:scale-160 group-hover:scale-130"
            @click="handleAppClick('calendar', 'Calendar')"
            :class="{
              'opacity-50': authStore.isAuthenticated && !authStore.canAccessApp('calendar'),
            }"
          />
        </div>
      </div>
    </div>
  `
}
