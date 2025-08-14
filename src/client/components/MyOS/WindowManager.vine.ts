import { useWindowStore } from '../../stores/windowStore'
import { DesktopAppWindow } from './AppWindow.vine'

export function DesktopWindowManager() {
  const store = useWindowStore()
  const { windows } = storeToRefs(store)

  return vine`
    <div class="window-manager absolute inset-0 pointer-events-none">
      <template v-for="w in windows" :key="w.id">
        <DesktopAppWindow :winState="w" class="pointer-events-auto" />
      </template>
    </div>
  `
}
