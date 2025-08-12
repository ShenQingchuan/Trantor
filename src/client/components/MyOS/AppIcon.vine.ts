interface AppIconProps {
  appId: string
  appName: string
  iconClass: string
  isAuthenticated: boolean
  canAccess: boolean
}

export function AppIcon(props: AppIconProps) {
  const emits = vineEmits<{
    startApp: [appId: string, appName: string]
  }>()

  const handleClick = () => {
    emits('startApp', props.appId, props.appName)
  }

  return vine`
    <div
      :class="[
        iconClass,
        'text-5xl flex-center h-14 relative origin-bottom group cursor-pointer transition-transform duration-200 md:hover:scale-160 md:group-hover:scale-130',
        { 'opacity-50': isAuthenticated && !canAccess },
      ]"
      @click="handleClick"
    />
  `
}
