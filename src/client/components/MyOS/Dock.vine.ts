import type { OpenWindowOptions } from '../../types/windowManager'
import chatAppIconSrc from '../../assets/chat-app.webp'
import musicPlayerIconSrc from '../../assets/music-player.webp'
import { useAuthStore } from '../../stores/authStore'
import { useWindowStore } from '../../stores/windowStore'
import { AppIcon } from './AppIcon.vine'

export function Dock() {
  const emits = vineEmits<{
    appClick: [payload: OpenWindowOptions]
  }>()

  const authStore = useAuthStore()
  const windowStore = useWindowStore()
  const openByApp = computed<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    for (const w of windowStore.windows)
      map[w.appId] = true
    return map
  })
  const activeAppId = computed(() => windowStore.getActiveWindow?.appId || '')

  // 全屏时 Dock 自动隐藏，仅在底部悬停时抬起
  const autoHideActive = computed(() => windowStore.windows.some(w => w.isMaximized && !w.isMinimized))
  const showDock = ref(false)
  let hideTimer: number | null = null
  const clearHideTimer = () => {
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
  }
  const onEnterRevealZone = () => {
    if (!autoHideActive.value)
      return
    clearHideTimer()
    showDock.value = true
  }
  const onLeaveDock = () => {
    if (!autoHideActive.value)
      return
    clearHideTimer()
    hideTimer = window.setTimeout(() => {
      showDock.value = false
    }, 220)
  }
  watch(autoHideActive, (active) => {
    if (!active) {
      clearHideTimer()
      showDock.value = false
    }
  })

  vineStyle.scoped(`
    .dock-transition {
      transition: transform 0.18s ease-in-out, opacity 0.18s ease-in-out;
      will-change: transform, opacity;
    }
  `)

  const handleAppClick = (payload: OpenWindowOptions) => {
    emits('appClick', payload)
  }

  return vine`
    <!-- 底部唤起传感器，仅在全屏下启用 -->
    <div
      v-if="autoHideActive"
      class="fixed bottom-0 left-0 w-full h-2 md:h-3"
      :style="{ zIndex: 9999 }"
      @mouseenter="onEnterRevealZone"
    />

    <div
      class="dock shadow fixed bottom-0 row-flex py-2 px-6 self-center rounded bg-zinc-100/20 backdrop-blur dark:bg-dark-500 backdrop-blur-md backdrop-saturate-150 z-9000"
      :class="{
        'translate-y-full opacity-0 pointer-events-none': autoHideActive && !showDock,
        'translate-y-0 opacity-100 pointer-events-auto': !autoHideActive || showDock,
      }"
      @mouseleave="onLeaveDock"
      @mouseenter="clearHideTimer()"
    >
      <div class="relative row-flex gap-4">
        <!-- 聊天应用 -->
        <AppIcon
          appId="chat"
          appName="AI Chat"
          class="w-10.5 rounded"
          :imgSrc="chatAppIconSrc"
          :isAuthenticated="authStore.isAuthenticated"
          :canAccess="authStore.canAccessApp('chat')"
          :isOpen="openByApp.chat"
          :isActive="activeAppId === 'chat'"
          @start-app="handleAppClick"
        />

        <!-- 音乐播放器 -->
        <AppIcon
          appId="music"
          appName="Music"
          class="w-10.5 rounded"
          :imgSrc="musicPlayerIconSrc"
          :isAuthenticated="authStore.isAuthenticated"
          :canAccess="authStore.canAccessApp('music')"
          :isOpen="openByApp.music"
          :isActive="activeAppId === 'music'"
          @start-app="handleAppClick"
        />
      </div>
    </div>
  `
}
