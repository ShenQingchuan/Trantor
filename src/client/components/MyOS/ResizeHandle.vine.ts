export default function ResizeHandle(props: {
  direction: string
  position: 'edge' | 'corner'
}) {
  const emit = vineEmits<{
    resizeStart: [direction: string, event: MouseEvent]
  }>()

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    emit('resizeStart', props.direction, e)
  }

  const getCursorClass = () => {
    const direction = props.direction
    if (props.position === 'corner') {
      const cursorMap: Record<string, string> = {
        se: 'cursor-se-resize',
        sw: 'cursor-sw-resize',
        ne: 'cursor-ne-resize',
        nw: 'cursor-nw-resize',
      }
      return cursorMap[direction] || 'cursor-se-resize'
    }
    else {
      const cursorMap: Record<string, string> = {
        e: 'cursor-e-resize',
        w: 'cursor-w-resize',
        s: 'cursor-s-resize',
        n: 'cursor-n-resize',
      }
      return cursorMap[direction] || 'cursor-se-resize'
    }
  }

  const getPositionClasses = () => {
    const direction = props.direction
    if (props.position === 'corner') {
      const positionMap: Record<string, string> = {
        se: 'right-1 bottom-1 w-5 h-5',
        sw: 'left-1 bottom-1 w-5 h-5',
        ne: 'right-1 top-1 w-5 h-5',
        nw: 'left-1 top-1 w-5 h-5',
      }
      return positionMap[direction] || 'right-1 bottom-1 w-5 h-5'
    }
    else {
      const positionMap: Record<string, string> = {
        e: 'right-0 top-0 bottom-0 w-1',
        w: 'left-0 top-0 bottom-0 w-1',
        s: 'bottom-0 left-0 right-0 h-1',
        n: 'top-10 left-0 right-0 h-1',
      }
      return positionMap[direction] || 'right-0 top-0 bottom-0 w-1'
    }
  }

  const getCornerIconClass = () => {
    const direction = props.direction
    const iconMap: Record<string, string> = {
      se: 'i-lucide:move-diagonal-2',
      sw: 'i-lucide:move-diagonal-2 rotate-90',
      ne: 'i-lucide:move-diagonal-2 -rotate-90',
      nw: 'i-lucide:move-diagonal-2 rotate-180',
    }
    return iconMap[direction] || 'i-lucide:move-diagonal-2'
  }

  return vine`
    <div
      class="absolute opacity-0 hover:opacity-100 transition-opacity"
      :class="[getPositionClasses(), getCursorClass()]"
      @mousedown="handleMouseDown"
    >
      <div v-if="position === 'corner'" :class="getCornerIconClass()" class="text-zinc-400" />
    </div>
  `
}
