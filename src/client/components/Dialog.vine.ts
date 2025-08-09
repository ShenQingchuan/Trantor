import { onClickOutside } from '@vueuse/core'

export function Dialog(props: {
  title?: string
}) {
  const emits = vineEmits(['close', 'confirm', 'cancel'])

  const { t } = useI18n()
  const show = vineModel<boolean>('show', { default: false })
  const dialogRef = useTemplateRef('dialogRef')

  // 关闭对话框
  const closeDialog = (action: 'confirm' | 'cancel' | 'close' = 'close') => {
    show.value = false
    emits(action)
  }

  // 点击遮罩关闭
  const handleOverlayClick = (event: Event) => {
    if (event.target === event.currentTarget) {
      closeDialog()
    }
  }

  // 点击外部关闭
  onClickOutside(dialogRef, () => {
    closeDialog()
  })

  return vine`
    <!-- API Key 设置对话框 -->
    <Teleport to="body">
      <div
        v-if="show"
        class="set-api-key-dialog fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click="handleOverlayClick"
      >
        <div ref="dialogRef" class="bg-white rounded-lg shadow-xl p-6 w-96 max-w-md mx-4" @click.stop>
          <!-- 对话框标题 -->
          <slot name="title">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
              <button
                @click="closeDialog()"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </slot>

          <!-- 内容体 -->
          <slot />

          <!-- 按钮组 -->
          <slot name="actions">
            <div class="flex justify-end space-x-3">
              <button
                @click="closeDialog('cancel')"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                {{ t('set_api_key_dialog__cancel') }}
              </button>
              <button
                @click="closeDialog('confirm')"
                class="px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-md hover:bg-slate-700 transition-colors"
              >
                {{ t('set_api_key_dialog__confirm') }}
              </button>
            </div>
          </slot>
        </div>
      </div>
    </Teleport>
  `
}
