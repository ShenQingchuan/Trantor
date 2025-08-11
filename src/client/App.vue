<script setup lang="ts">
import { useDark, useFavicon } from '@vueuse/core'
import { darkTheme, NConfigProvider, NMessageProvider } from 'naive-ui'
import { RouterView } from 'vue-router'
import { AppToggleActions, DesktopHeader, MobileHeader } from './components/Header.vine'

const isDark = useDark()
const theme = computed(() => isDark.value ? darkTheme : null)

useFavicon(isDark.value ? '/favicon-dark.ico' : '/favicon.ico')
</script>

<template>
  <NConfigProvider :theme="theme">
    <NMessageProvider>
      <div class="min-w-screen min-h-screen col-flex pt-30 flex-1">
        <MobileHeader />
        <DesktopHeader />
        <AppToggleActions />

        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </div>
    </NMessageProvider>
  </NConfigProvider>
</template>
