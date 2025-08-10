export function PageMyOS() {
  return vine`
    <div class="page-my-os col-flex flex-1 flex-center">
      <div
        class="dock absolute bottom-4 py-2 px-6 rounded z-10 bg-dark-200/60 backdrop-blur-md backdrop-saturate-150 shadow-lg"
      >
        <div class="relative row-flex gap-4 items-end">
          <div class="flex-center h-14 relative origin-bottom">
            <div
              class="i-ri:finder-fill text-5xl transition-transform duration-200 origin-bottom hover:scale-160 group-hover:scale-130"
            />
          </div>
          <div class="flex-center h-14 relative origin-bottom">
            <div
              class="i-ph:wechat-logo-duotone text-5xl transition-transform duration-200 origin-bottom hover:scale-160 group-hover:scale-130"
            />
          </div>
          <div class="flex-center h-14 relative origin-bottom">
            <div
              class="i-ph:calendar-dots-fill text-5xl transition-transform duration-200 origin-bottom hover:scale-160 group-hover:scale-130"
            />
          </div>
        </div>
      </div>
    </div>
  `
}
