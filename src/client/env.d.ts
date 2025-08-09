/// <reference types="vite/client" />

declare module 'vue' {
  interface GlobalDirectives {
    vMotion: typeof import('@vueuse/motion').MotionDirective
    vMotionFade: typeof import('@vueuse/motion').fade
    vMotionFadeVisible: typeof import('@vueuse/motion').fadeVisible
    vMotionSlideVisibleLeft: typeof import('@vueuse/motion').slideVisibleLeft
    vMotionSlideVisibleRight: typeof import('@vueuse/motion').slideVisibleRight
    vMotionSlideVisibleTop: typeof import('@vueuse/motion').slideVisibleTop
    vMotionSlideVisibleBottom: typeof import('@vueuse/motion').slideVisibleBottom
  }
  interface HTMLAttributes {
    duration?: number // @vueuse/motion duration time
  }
}

declare global {
  interface Window {
    promptEditor?: import('prosekit/core').Editor
  }
}

export {}
