import type { AppWindowState } from '../../types/windowManager'
import { useWindowStore } from '../../stores/windowStore'
import ResizeHandle from './ResizeHandle.vine'

export function DesktopAppWindowContainer(props: {
  winState: AppWindowState
}) {
  const store = useWindowStore()
  const isResizing = ref(false)
  const isDragging = ref(false)
  const startPos = reactive({ x: 0, y: 0 })
  const startSize = reactive({ w: 0, h: 0 })
  const startWindowPos = reactive({ x: 0, y: 0 })
  const resizeDirection = ref('se')

  const onDragging = (e: MouseEvent) => {
    if (!isDragging.value)
      return
    const dx = e.clientX - startPos.x
    const dy = e.clientY - startPos.y
    store.moveWindow(props.winState.id, startWindowPos.x + dx, startWindowPos.y + dy)
  }
  const onDragEnd = () => {
    isDragging.value = false
    window.removeEventListener('mousemove', onDragging)
  }
  const onMouseDownHeader = (e: MouseEvent) => {
    e.preventDefault()
    if (props.winState.isMaximized)
      return
    isDragging.value = true
    startPos.x = e.clientX
    startPos.y = e.clientY
    startWindowPos.x = props.winState.x
    startWindowPos.y = props.winState.y
    store.setActive(props.winState.id)
    window.addEventListener('mousemove', onDragging)
    window.addEventListener('mouseup', onDragEnd, { once: true })
  }

  const onResizing = (e: MouseEvent) => {
    if (!isResizing.value)
      return
    const dw = e.clientX - startPos.x
    const dh = e.clientY - startPos.y

    let newWidth = startSize.w
    let newHeight = startSize.h
    let newX = startWindowPos.x
    let newY = startWindowPos.y

    // 根据调整方向计算新的尺寸和位置
    if (resizeDirection.value.includes('e')) { // 右边
      newWidth = startSize.w + dw
    }
    if (resizeDirection.value.includes('w')) { // 左边
      newWidth = startSize.w - dw
      newX = startWindowPos.x + dw
    }
    if (resizeDirection.value.includes('s')) { // 下边
      newHeight = startSize.h + dh
    }
    if (resizeDirection.value.includes('n')) { // 上边
      newHeight = startSize.h - dh
      newY = startWindowPos.y + dh
    }

    // 先调整位置，再调整尺寸
    if (newX !== startWindowPos.x || newY !== startWindowPos.y) {
      store.moveWindow(props.winState.id, newX, newY)
    }
    store.resizeWindow(props.winState.id, newWidth, newHeight)
  }

  const onResizeEnd = () => {
    isResizing.value = false
    window.removeEventListener('mousemove', onResizing)
  }

  const handleResizeStart = (direction: string, e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isResizing.value = true
    resizeDirection.value = direction
    startPos.x = e.clientX
    startPos.y = e.clientY
    startSize.w = props.winState.width
    startSize.h = props.winState.height
    startWindowPos.x = props.winState.x
    startWindowPos.y = props.winState.y

    store.setActive(props.winState.id)
    window.addEventListener('mousemove', onResizing)
    window.addEventListener('mouseup', onResizeEnd, { once: true })
  }

  const onClose = () => store.closeWindow(props.winState.id)
  const onMinimize = () => store.minimizeWindow(props.winState.id)
  const onMaximize = () => store.toggleMaximize(props.winState.id)

  vineStyle.scoped(`
    .window-shell {
      backdrop-filter: saturate(150%) blur(10px);
    }
    .traffic-dot { width: 12px; height: 12px; border-radius: 9999px; }
  `)

  const computedStyle = computed(() => {
    if (props.winState.isMaximized) {
      // 全屏时顶部留出空间不遮挡 dock（底部也留出 80px）
      return {
        left: '0',
        right: '0',
        top: '0',
        bottom: '0',
        width: '100%',
        height: '100%',
      }
    }
    return {
      left: `${props.winState.x}px`,
      top: `${props.winState.y}px`,
      width: `${props.winState.width}px`,
      height: `${props.winState.height}px`,
    }
  })

  return vine`
    <div
      v-show="!winState.isMinimized"
      v-motion-fade
      class="window-shell col-flex shadow-lg fixed overflow-hidden rounded-xl border border-zinc-200/30 bg-white/80 dark:bg-zinc-900/70"
      :class="{
        'outline-1 outline-slate-400': winState.isActive,
        'select-none': isDragging || isResizing,
      }"
      :style="{
        ...computedStyle,
        zIndex: winState.zIndex,
      }"
      @mousedown="store.setActive(winState.id)"
    >
      <!-- 标题栏 -->
      <div
        class="relative active:cursor-move row-flex items-center gap-2 px-3 select-none bg-zinc-100/60 dark:bg-zinc-800/60 h-40px"
        @mousedown.stop="onMouseDownHeader"
      >
        <div class="row-flex gap-2 items-center cursor-default py-4">
          <div class="traffic-dot bg-red-400 cursor-pointer" @click.stop="onClose" />
          <div class="traffic-dot bg-yellow-400 cursor-pointer" @click.stop="onMinimize" />
          <div class="traffic-dot bg-green-400 cursor-pointer" @click.stop="onMaximize" />
        </div>

        <!-- 绝对居中的标题 -->
        <div
          class="absolute inset-0 row-flex items-center justify-center gap-2 text-sm text-zinc-700 dark:text-zinc-200 pointer-events-none"
        >
          <div v-show="winState.icon" :class="winState.icon" />
          <span>{{ winState.title }}</span>
        </div>
      </div>

      <!-- 内容区：插槽自定义 -->
      <div class="col-flex w-full flex-1 h-[calc(100%-40px)] bg-white/70 dark:bg-zinc-950/60">
        <slot />
      </div>

      <!-- 调整尺寸手柄 -->
      <!-- 四边 -->
      <ResizeHandle direction="e" position="edge" @resize-start="handleResizeStart" />
      <ResizeHandle direction="w" position="edge" @resize-start="handleResizeStart" />
      <ResizeHandle direction="s" position="edge" @resize-start="handleResizeStart" />

      <!-- 四角 -->
      <ResizeHandle direction="se" position="corner" @resize-start="handleResizeStart" />
      <ResizeHandle direction="sw" position="corner" @resize-start="handleResizeStart" />
      <ResizeHandle direction="ne" position="corner" @resize-start="handleResizeStart" />
    </div>
  `
}
