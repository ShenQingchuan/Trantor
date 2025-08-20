import type { AppWindowState } from '../../types/windowManager'
import { capitalize } from '../../../bridge/utils'
import { useWindowStore } from '../../stores/windowStore'
import AboutMyOS from './AboutMyOS.vine'
import { ChatApp } from './apps/ChatApp.vine'
import { MusicApp } from './apps/MusicApp.vine'
import { DesktopAppWindowContainer } from './AppWindow.vine'

// 应用映射：appId -> 组件
const appComponentMap: Record<string, any> = {
  chat: ChatApp,
  music: MusicApp,
  about: AboutMyOS,
}

function AppWindow(props: {
  winState: AppWindowState
}) {
  const { t } = useI18n()
  const appComponent = computed(() => (
    appComponentMap[props.winState.appId] || 'div'
  ))
  const hasComponent = computed(() => (
    Boolean(appComponentMap[props.winState.appId])
  ))

  return vine`
    <DesktopAppWindowContainer :winState="winState" class="pointer-events-auto">
      <component
        :is="appComponent"
        :class="{
          'col-flex flex-center w-full flex-1': !hasComponent,
        }"
      >
        <div v-if="!hasComponent" class="text-zinc-500 font-italic">
          {{ t('os_app_not_implemented', { appId: capitalize(winState.appId) }) }}
        </div>
      </component>
    </DesktopAppWindowContainer>
  `
}

export function DesktopWindowManager() {
  const store = useWindowStore()
  const { windows } = storeToRefs(store)

  return vine`
    <div class="window-manager absolute inset-0 pointer-events-none">
      <AppWindow v-for="w in windows" :key="w.id" :winState="w" />
    </div>
  `
}
