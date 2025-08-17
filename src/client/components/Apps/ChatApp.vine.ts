import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'
import { unified } from 'unified'
import { useChatFlowStore } from '../../stores/chatFlowStore'
import { MessageThread } from '../ChatFlow/MessageThread.vine'
import ProseEditor from '../PromptEditor/prose.vine'

function htmlToMarkdown(html: string): Promise<string> {
  return unified()
    .use(rehypeParse)
    .use(rehypeRemark)
    .use(remarkStringify)
    .process(html)
    .then(file => file.value.toString())
}

export function ChatApp() {
  const { t } = useI18n()
  const chatFlowStore = useChatFlowStore()
  const { isChatStreaming, isShowGuide, chatDisplayMessages } = storeToRefs(chatFlowStore)

  const editorRef = useTemplateRef('editorRef')

  const handleSend = async () => {
    const editor = editorRef.value?.editor
    if (!editor || isChatStreaming.value)
      return

    const html = editor.getDocHTML()
    const text = await htmlToMarkdown(html)
    if (!text)
      return

    try {
      chatFlowStore.sendPrompt(text)
      editor.setContent('')
    }
    catch (error) {
      console.error('发送消息失败:', error)
    }
  }

  const handleEnterPress = async () => {
    const editor = editorRef.value?.editor
    if (!editor || isChatStreaming.value)
      return

    // 发送消息并清空编辑器
    await handleSend()
  }

  return vine`
    <div class="relative w-full h-full col-flex bg-white dark:bg-zinc-950">
      <!-- 欢迎界面 -->
      <div
        v-if="isShowGuide && chatDisplayMessages.length === 0"
        class="col-flex items-center justify-center h-full px-8 text-center pb-200px"
      >
        <div class="i-bxs:bot text-6xl text-violet-400 mb-6" />
        <div class="text-2xl font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
          {{ t('chat_flow__welcome_title') }}
        </div>
        <div class="text-zinc-500 dark:text-zinc-400 max-w-md">
          {{ t('chat_flow__welcome_subtitle') }}
        </div>
      </div>

      <!-- 消息列表：给底部留出输入区域的空间 -->
      <div v-else class="flex-1 overflow-auto pb-200px">
        <MessageThread />
      </div>

      <!-- 输入区域：绝对定位在底部 -->
      <div
        class="col-flex gap-2 p-4 min-h-100px max-h-200px absolute bottom-0 left-0 right-0 border-t border-zinc-200/50 dark:border-zinc-700/50 bg-zinc-50 dark:bg-zinc-900"
      >
        <div class="row-flex gap-3 w-full flex-1 relative">
          <ProseEditor
            ref="editorRef"
            @enterPress="handleEnterPress"
            container-class="w-full min-h-[44px] max-h-[120px] overflow-y-auto bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-4 py-3 focus-within:border-violet-400 dark:focus-within:border-violet-500 transition-colors"
          />
        </div>
        <div class="row-flex">
          <!-- 提示文案 -->
          <div class="text-xs text-center text-zinc-400 dark:text-zinc-500">
            {{ t('chat_flow__tips') }}
          </div>

          <button
            :disabled="isChatStreaming"
            @click="handleSend"
            class="row-flex gap-2 items-center justify-center px-4 py-2 w-auto h-auto rounded-md transition-all duration-200 ml-auto"
            :class="[
              isChatStreaming
                ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                : 'bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700 text-white hover:scale-105 active:scale-95',
            ]"
          >
            <div v-if="isChatStreaming" class="i-svg-spinners:pulse-multiple text-lg" />

            <template v-else>
              <div class="i-lucide:send text-lg" />
              <div class="text-sm">{{ t('chat_flow__send') }}</div>
            </template>
          </button>
        </div>
      </div>
    </div>
  `
}
