export function IdleScreen() {
  const { t } = useI18n()

  return vine`
    <div class="fixed inset-0 z-20 col-flex items-center justify-center dark:bg-black bg-white">
      <!-- 优雅的加载动画 -->
      <div class="col-flex items-center gap-6">
        <!-- Logo 区域 -->
        <div class="relative">
          <div
            class="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 dark:(from-cyan-800 to-teal-600) flex items-center justify-center shadow-2xl"
          >
            <div class="i-ri:computer-line text-4xl text-white" />
          </div>
          <!-- 外圈脉冲动画 -->
          <div
            class="absolute inset-0 w-24 h-24 rounded-full border-2 border-blue-400/30 animate-ping"
          />
          <div
            class="absolute inset-0 w-24 h-24 rounded-full border-2 border-purple-400/30 animate-ping"
            style="animation-delay: 0.5s"
          />
        </div>

        <!-- 系统名称 -->
        <div class="text-center font-sans">
          <h1 class="text-3xl font-light text-white mb-2 tracking-wider">
            {{ t('os_login_title') }}
          </h1>
          <div class="text-blue-500 dark:text-blue-300 text-lg tracking-wide">
            {{ t('os_common_loading') }}
          </div>
        </div>

        <!-- 加载指示器 -->
        <div class="row-flex gap-0.8">
          <div class="i-svg-spinners:3-dots-fade" />
        </div>
      </div>
    </div>
  `
}
