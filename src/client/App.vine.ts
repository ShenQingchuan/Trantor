import { useDark, useFavicon } from '@vueuse/core'
import { RouterView } from 'vue-router'
import { AppToggleActions, DesktopHeader, MobileHeader } from './components/Header.vine'

function CommonHeader() {
  return vine`
    <DesktopHeader />
    <MobileHeader />
    <AppToggleActions />
  `
}

const hiddenHeaderRoutes = new Set([
  '/os', // MyOS 页面需要全屏沉浸感
])

export function App() {
  const isDark = useDark()
  useFavicon(isDark.value ? '/favicon-dark.ico' : '/favicon.ico')
  const route = useRoute()
  const shouldShowHeader = computed(() => {
    return !hiddenHeaderRoutes.has(route.path)
  })

  return vine`
    <div
      class="min-w-screen min-h-screen col-flex flex-1"
      :class="{
        'pt-30': shouldShowHeader,
      }"
    >
      <CommonHeader v-if="shouldShowHeader" />

      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </div>
  `
}
