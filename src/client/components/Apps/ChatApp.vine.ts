import ProseEditor from '../PromptEditor/prose.vine'

export function ChatApp() {
  const { t } = useI18n()

  return vine`
    <div class="w-full h-full col-flex">
      <div class="flex-1 overflow-auto p-4 text-zinc-500">
        <!-- TODO: 实现对话列表与消息区 -->
        <div class="text-sm">
          {{ t('os_app_comming_soon', { appId: 'Chat' }) }}
        </div>
      </div>
      <div class="row-flex gap-2 p-3 border-t border-zinc-200/50 dark:border-zinc-800/60">
        <ProseEditor container-class="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-3" />
        <button class="btn">
          {{ t('chat_flow__send') }}
        </button>
      </div>
    </div>
  `
}
