import { useDark, useFavicon } from '@vueuse/core'
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
    // 在初始加载或刷新时，route.path 可能会短暂地是 '/'，在路由同步到实际 URL 之前。
    // 这会导致页面闪烁。我们可以通过 window.location.pathname 获取首次渲染时的真实路径。
    const currentPath = route.path === '/' && window.location.pathname !== '/'
      ? window.location.pathname
      : route.path
    return !hiddenHeaderRoutes.has(currentPath)
  })

  return vine`
    <div
      class="min-w-screen min-h-screen col-flex flex-1"
      :class="{
        'pt-30': shouldShowHeader,
      }"
    >
      <RouterView v-slot="{ route, Component }">
        <CommonHeader v-if="shouldShowHeader" />
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>

      <!-- 全局弹窗挂载点 -->
      <div id="global-dialog-mount" />
    </div>
  `
}
