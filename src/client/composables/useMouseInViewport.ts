import { useEventListener } from '@vueuse/core'
import { ref } from 'vue'

export function useMouseInViewport() {
  const isOutside = ref(false)

  const handleMouseLeave = () => isOutside.value = true
  const handleMouseEnter = () => isOutside.value = false

  useEventListener(document, 'mouseleave', handleMouseLeave)
  useEventListener(document, 'mouseenter', handleMouseEnter)

  return {
    isOutside,
  }
}
