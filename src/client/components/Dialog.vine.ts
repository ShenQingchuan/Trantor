import { onClickOutside } from '@vueuse/core'
import { createApp } from 'vue'

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
                <div class="i-mdi:close text-xl" />
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
                {{ t('dialog__cancel') }}
              </button>
              <button
                @click="closeDialog('confirm')"
                class="px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-md hover:bg-slate-700 transition-colors"
              >
                {{ t('dialog__confirm') }}
              </button>
            </div>
          </slot>
        </div>
      </div>
    </Teleport>
  `
}

// === 命令式调用功能 ===

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
}

interface PromptOptions {
  title?: string
  message: string
  defaultValue?: string
  confirmText?: string
  cancelText?: string
}

// 全局弹窗状态管理
const dialogState = reactive({
  confirmVisible: false,
  promptVisible: false,
  confirmOptions: null as ConfirmOptions | null,
  promptOptions: null as PromptOptions | null,
  confirmResolve: null as ((value: boolean) => void) | null,
  promptResolve: null as ((value: string | null) => void) | null,
  promptValue: '',
})

// 全局弹窗组件 - 自动 Teleport 到挂载点
function GlobalDialogs() {
  // 确认框处理函数
  const handleConfirmOk = () => {
    dialogState.confirmVisible = false
    if (dialogState.confirmResolve) {
      dialogState.confirmResolve(true)
    }
    dialogState.confirmOptions = null
    dialogState.confirmResolve = null
  }

  const handleConfirmCancel = () => {
    dialogState.confirmVisible = false
    if (dialogState.confirmResolve) {
      dialogState.confirmResolve(false)
    }
    dialogState.confirmOptions = null
    dialogState.confirmResolve = null
  }

  const handleConfirmOverlay = (event: Event) => {
    if (event.target === event.currentTarget) {
      handleConfirmCancel()
    }
  }

  // 输入框处理函数
  const handlePromptOk = () => {
    dialogState.promptVisible = false
    if (dialogState.promptResolve) {
      dialogState.promptResolve(dialogState.promptValue)
    }
    dialogState.promptOptions = null
    dialogState.promptResolve = null
    dialogState.promptValue = ''
  }

  const handlePromptCancel = () => {
    dialogState.promptVisible = false
    if (dialogState.promptResolve) {
      dialogState.promptResolve(null)
    }
    dialogState.promptOptions = null
    dialogState.promptResolve = null
    dialogState.promptValue = ''
  }

  const handlePromptOverlay = (event: Event) => {
    if (event.target === event.currentTarget) {
      handlePromptCancel()
    }
  }

  const handlePromptKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handlePromptOk()
    }
    else if (event.key === 'Escape') {
      handlePromptCancel()
    }
  }

  // 监听 prompt 显示状态，设置默认值和焦点
  watch(() => dialogState.promptVisible, (visible) => {
    if (visible && dialogState.promptOptions) {
      dialogState.promptValue = dialogState.promptOptions.defaultValue || ''
      nextTick(() => {
        const input = document.querySelector('#global-prompt-input') as HTMLInputElement
        if (input) {
          input.focus()
          input.select()
        }
      })
    }
  })

  return vine`
    <!-- 确认框 -->
    <Teleport to="#global-dialog-mount">
      <div
        v-if="dialogState.confirmVisible && dialogState.confirmOptions"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-9000"
        @click="handleConfirmOverlay"
      >
        <div
          class="bg-white dark:bg-zinc-800 rounded-lg shadow-xl p-6 w-96 max-w-md mx-4"
          @click.stop
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-zinc-100">
              {{ dialogState.confirmOptions.title || '确认' }}
            </h3>
          </div>
          <div class="mb-6 text-gray-600 dark:text-zinc-300">
            {{ dialogState.confirmOptions.message }}
          </div>
          <div class="flex justify-end space-x-3">
            <button
              @click="handleConfirmCancel"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-700 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
            >
              {{ dialogState.confirmOptions.cancelText || '取消' }}
            </button>
            <button
              @click="handleConfirmOk"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              {{ dialogState.confirmOptions.confirmText || '确认' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 输入框 -->
    <Teleport to="#global-dialog-mount">
      <div
        v-if="dialogState.promptVisible && dialogState.promptOptions"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        style="z-index: 9999"
        @click="handlePromptOverlay"
      >
        <div
          class="bg-white dark:bg-zinc-800 rounded-lg shadow-xl p-6 w-96 max-w-md mx-4"
          @click.stop
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-zinc-100">
              {{ dialogState.promptOptions.title || '输入' }}
            </h3>
          </div>
          <div class="mb-4 text-gray-600 dark:text-zinc-300">
            {{ dialogState.promptOptions.message }}
          </div>
          <div class="mb-6">
            <input
              id="global-prompt-input"
              v-model="dialogState.promptValue"
              @keydown="handlePromptKeyDown"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
              :placeholder="dialogState.promptOptions.message"
            />
          </div>
          <div class="flex justify-end space-x-3">
            <button
              @click="handlePromptCancel"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-700 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
            >
              {{ dialogState.promptOptions.cancelText || '取消' }}
            </button>
            <button
              @click="handlePromptOk"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              {{ dialogState.promptOptions.confirmText || '确认' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  `
}

// 全局组件实例
let globalDialogInstance: any = null

// 初始化全局弹窗系统
function initGlobalDialogs() {
  if (globalDialogInstance)
    return

  // 创建全局弹窗组件实例并挂载到body
  const container = document.createElement('div')
  document.body.appendChild(container)

  // 使用 Vue 的 createApp 挂载全局弹窗组件
  globalDialogInstance = createApp(GlobalDialogs)
  globalDialogInstance.mount(container)
}

// 命令式调用的 hooks
export function useConfirm() {
  return (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      // 初始化全局弹窗系统
      initGlobalDialogs()

      dialogState.confirmOptions = options
      dialogState.confirmResolve = resolve
      dialogState.confirmVisible = true
    })
  }
}

export function usePrompt() {
  return (options: PromptOptions): Promise<string | null> => {
    return new Promise((resolve) => {
      // 初始化全局弹窗系统
      initGlobalDialogs()

      dialogState.promptOptions = options
      dialogState.promptResolve = resolve
      dialogState.promptVisible = true
    })
  }
}
