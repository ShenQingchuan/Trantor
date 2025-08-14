// 使用媒体查询判断是否为“手机模式”（小于 sm 断点 500px）

import { useMediaQuery } from '@vueuse/core'

// 平板（>= 500px）因为屏幕够大与 PC 统一按桌面模式处理
export function useIsPhoneMode() {
  // 这里使用 vueuse 的 useMediaQuery，以便与 @uno.config.ts 中的 sm=500px 对齐
  const isPhone = useMediaQuery('(max-width: 499px)')
  return isPhone
}
