<script setup lang="ts">
import { useDark, useFavicon } from '@vueuse/core'
import { RouterView } from 'vue-router'
import { AppToggleActions, DesktopHeader, MobileHeader } from './components/Header.vine'

const isDark = useDark()
useFavicon(isDark.value ? '/favicon-dark.ico' : '/favicon.ico')
</script>

<template>
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
</template>
