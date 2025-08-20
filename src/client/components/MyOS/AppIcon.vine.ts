import type { OpenWindowOptions } from '../../types/windowManager'

interface AppIconProps {
  appId: string
  appName: string
  iconClass?: string
  imgSrc?: string
  isAuthenticated: boolean
  canAccess: boolean
  isOpen?: boolean
  isActive?: boolean
}

export function AppIcon(props: AppIconProps) {
  const emits = vineEmits<{
    startApp: [payload: OpenWindowOptions]
  }>()

  const attrs = useAttrs()
  const handleClick = () => {
    emits('startApp', {
      appId: props.appId,
      title: props.appName,
      icon: props.iconClass,
      imgSrc: props.imgSrc,
    })
  }

  return vine`
    <div class="relative col-flex items-center gap-1 flex-shrink-0 pb-1">
      <div
        v-if="iconClass"
        :class="[
          iconClass,
          'group text-5xl flex-center relative origin-bottom cursor-pointer transition-transform duration-200 md:hover:scale-160 md:group-hover:scale-130',
          { 'opacity-50': isAuthenticated && !canAccess },
        ]"
        @click="handleClick"
      />
      <img
        v-else-if="imgSrc"
        :src="imgSrc"
        :class="[
          'group transition-transform duration-200 origin-bottom cursor-pointer md:hover:scale-160 md:group-hover:scale-130',
          attrs.class,
        ]"
        @click="handleClick"
      />

      <div
        class="absolute bottom--1 h-1.25 w-1.25 flex-shrink-0 rounded-full z-5001"
        :class="[isActive ? 'bg-zinc-500' : isOpen ? 'bg-zinc-400/70' : 'opacity-0']"
      />
    </div>
  `
}
