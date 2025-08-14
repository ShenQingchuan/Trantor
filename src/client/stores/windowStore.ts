import type { AppWindowState, OpenWindowOptions, WindowId } from '../types/windowManager'
import { nanoid } from 'nanoid'

const storeId = 'trantor:window-store' as const

export const useWindowStore = defineStore(storeId, () => {
  const windows = ref<AppWindowState[]>([])
  const activeWindowId = ref<WindowId | null>(null)
  const baseZIndex = 200

  const nextZIndex = computed(() => (
    windows.value.reduce((max, w) => Math.max(max, w.zIndex), baseZIndex) + 1
  ))

  const setActive = (id: WindowId) => {
    activeWindowId.value = id
    windows.value = windows.value.map(w => ({
      ...w,
      isActive: w.id === id,
      zIndex: w.id === id ? nextZIndex.value : w.zIndex,
    }))
  }

  const openWindow = (options: OpenWindowOptions) => {
    // 若同一 appId 已有窗口，则不再新建，直接恢复并激活
    const existing = windows.value
      .filter(w => w.appId === options.appId)
      .sort((a, b) => b.zIndex - a.zIndex)[0]

    if (existing) {
      existing.isMinimized = false
      setActive(existing.id)
      return existing.id
    }

    const id = nanoid()
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080
    const dockReserve = 96
    const offsetIndex = Math.min(windows.value.length, 8)
    const stepX = 24
    const stepY = 16

    const desiredWidth = options.initial?.width ?? 900
    const desiredHeight = options.initial?.height ?? 600
    const baseX = options.initial?.x ?? 80
    const baseY = options.initial?.y ?? 80
    const desiredX = baseX + stepX * offsetIndex
    const desiredY = baseY + stepY * offsetIndex

    const isNarrow = viewportWidth <= 740
    const maxInitialWidth = Math.max(320, viewportWidth - 16)
    const maxInitialHeight = Math.max(240, viewportHeight - dockReserve - 16)
    const targetWidth = isNarrow ? Math.floor(viewportWidth * 0.92) : desiredWidth
    const targetHeight = isNarrow ? Math.floor((viewportHeight - dockReserve) * 0.74) : desiredHeight
    const initWidth = Math.min(targetWidth, maxInitialWidth)
    const initHeight = Math.min(targetHeight, maxInitialHeight)

    const maxX = Math.max(0, viewportWidth - initWidth - 8)
    const maxY = Math.max(0, viewportHeight - initHeight - dockReserve)
    const clampedX = Math.min(Math.max(0, desiredX), maxX)
    const clampedY = Math.min(Math.max(0, desiredY), maxY)

    const w: AppWindowState = {
      id,
      appId: options.appId,
      title: options.title,
      icon: options.icon,
      isActive: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZIndex.value,
      width: initWidth,
      height: initHeight,
      x: clampedX,
      y: clampedY,
    }
    windows.value.push(w)
    setActive(id)
    return id
  }

  const closeWindow = (id: WindowId) => {
    const idx = windows.value.findIndex(w => w.id === id)
    if (idx === -1)
      return
    windows.value.splice(idx, 1)
    if (activeWindowId.value === id) {
      const last = windows.value.length > 0 ? windows.value[windows.value.length - 1] : null
      activeWindowId.value = last?.id ?? null
      if (activeWindowId.value)
        setActive(activeWindowId.value)
    }
  }

  const minimizeWindow = (id: WindowId) => {
    const w = windows.value.find(w => w.id === id)
    if (!w)
      return
    w.isMinimized = true
    if (activeWindowId.value === id)
      activeWindowId.value = null
  }

  const restoreWindow = (id: WindowId) => {
    const w = windows.value.find(w => w.id === id)
    if (!w)
      return
    w.isMinimized = false
    setActive(id)
  }

  const toggleMaximize = (id: WindowId) => {
    const w = windows.value.find(w => w.id === id)
    if (!w)
      return
    w.isMaximized = !w.isMaximized
    setActive(id)
  }

  const moveWindow = (id: WindowId, x: number, y: number) => {
    const w = windows.value.find(w => w.id === id)
    if (!w)
      return
    if (w.isMaximized)
      return
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080
    const dockReserve = 96
    const clampedX = Math.min(Math.max(0, x), Math.max(0, viewportWidth - w.width - 8))
    const clampedY = Math.min(Math.max(0, y), Math.max(0, viewportHeight - w.height - dockReserve))
    w.x = clampedX
    w.y = clampedY
  }

  const resizeWindow = (id: WindowId, width: number, height: number) => {
    const w = windows.value.find(w => w.id === id)
    if (!w)
      return
    if (w.isMaximized)
      return
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080
    const dockReserve = 96
    const minWidth = 360
    const minHeight = 200
    const maxWidth = Math.max(minWidth, viewportWidth - w.x - 8)
    const maxHeight = Math.max(minHeight, viewportHeight - w.y - dockReserve)
    w.width = Math.max(minWidth, Math.min(width, maxWidth))
    w.height = Math.max(minHeight, Math.min(height, maxHeight))
  }

  const getActiveWindow = computed(() => windows.value.find(w => w.isActive) || null)

  return {
    windows,
    activeWindowId,
    getActiveWindow,
    openWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    toggleMaximize,
    moveWindow,
    resizeWindow,
    setActive,
  }
})
