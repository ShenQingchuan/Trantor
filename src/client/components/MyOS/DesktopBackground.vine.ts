// 桌面背景组件 - 简约科幻风格

export function DesktopBackground() {
  const isDark = ref(true) // 默认深色主题

  // 监听主题变化
  onMounted(() => {
    const html = document.documentElement
    isDark.value = html.classList.contains('dark')

    // 监听主题切换
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          isDark.value = html.classList.contains('dark')
        }
      })
    })

    observer.observe(html, { attributes: true })

    onUnmounted(() => observer.disconnect())
  })

  return vine`
    <div class="desktop-background fixed inset-0 z-0 overflow-hidden">
      <!-- 主渐变背景 -->
      <div
        class="absolute inset-0 transition-all duration-1000 ease-out"
        :class="
          isDark
            ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900'
            : 'bg-gradient-to-br from-slate-50 via-indigo-50 to-sky-50'
        "
      />

      <!-- 网格背景 -->
      <div
        class="absolute inset-0"
        :class="isDark ? 'opacity-20' : 'opacity-30'"
        style="
          background-image:
            linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px);
          background-size: 50px 50px;
        "
      />
    </div>
  `
}
