import type { OpenWindowOptions } from '../../types/windowManager'

interface AppIconProps {
  appId: string
  appName: string
  iconClass: string
  isAuthenticated: boolean
  canAccess: boolean
  isOpen?: boolean
  isActive?: boolean
}

export function AppIcon(props: AppIconProps) {
  const emits = vineEmits<{
    startApp: [payload: OpenWindowOptions]
  }>()

  const handleClick = () => {
    emits('startApp', {
      appId: props.appId,
      title: props.appName,
      icon: props.iconClass,
    })
  }

  return vine`
    <div class="col-flex items-center">
      <div
        :class="[
          iconClass,
          'text-5xl flex-center h-14 relative origin-bottom group cursor-pointer transition-transform duration-200 md:hover:scale-160 md:group-hover:scale-130',
          { 'opacity-50': isAuthenticated && !canAccess },
        ]"
        @click="handleClick"
      />
      <div
        class="h-1.25 w-1.25 rounded-full"
        :class="[
          isActive ? 'bg-zinc-500/50 dark:bg-zinc-200/50' : isOpen ? 'bg-zinc-400/70' : 'opacity-0',
        ]"
      />
    </div>
  `
}
