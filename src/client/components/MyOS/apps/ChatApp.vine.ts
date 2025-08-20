import { useEventListener } from '@vueuse/core'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'
import { unified } from 'unified'
import { useChatFlowStore } from '../../../stores/chatFlowStore'
import { useChatSessionStore } from '../../../stores/chatSessionStore'
import { ChatSessionSidebar } from '../../ChatFlow/ChatSessionSidebar.vine'
import { MessageThread } from '../../ChatFlow/MessageThread.vine'
import { useConfirm, usePrompt } from '../../Dialog.vine'
import ProseEditor from '../../PromptEditor/prose.vine'

// 聊天应用窗口配置
export const chatAppWindowConfig = {
  initial: {
    width: 900,
    height: 600,
    x: 120,
    y: 100,
  },
  constraints: {
    minWidth: 500,
    minHeight: 400,
  },
}

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
  const chatSessionStore = useChatSessionStore()
  const { isChatStreaming, isShowGuide, chatDisplayMessages } = storeToRefs(chatFlowStore)
  const { currentSession } = storeToRefs(chatSessionStore)

  const showSidebar = ref(true)
  const editorRef = useTemplateRef('editorRef')

  // 在 ChatApp 组件挂载时启用会话数据获取
  onMounted(() => {
    chatSessionStore.enableSessionsFetch()
  })

  const handleSend = async () => {
    const editor = editorRef.value?.editor
    if (!editor || isChatStreaming.value)
      return

    const html = editor.getDocHTML()
    const text = await htmlToMarkdown(html)
    if (!text)
      return

    try {
      // 立即清空输入框
      editor.setContent('')

      // 如果没有当前会话，创建一个新会话
      if (!currentSession.value) {
        await chatSessionStore.createNewSession()
      }

      await chatFlowStore.sendPrompt(text)
    }
    catch (error) {
      console.error('发送消息失败:', error)
    }
  }

  // 监听对话流状态变化，在对话完成后保存消息
  watch(isChatStreaming, async (isStreaming, prevStreaming) => {
    if (!isStreaming && prevStreaming && currentSession.value && chatDisplayMessages.value.length > 0) {
      try {
        await chatSessionStore.saveCurrentChatToSession(
          currentSession.value.id,
          chatDisplayMessages.value,
        )
      }
      catch (error) {
        console.error('保存对话失败:', error)
      }
    }
  })

  // 监听消息数量变化，实时更新当前会话的消息计数显示
  const currentSessionDisplayCount = ref(0)

  watch(
    () => chatDisplayMessages.value.length,
    (newCount) => {
      currentSessionDisplayCount.value = newCount
    },
    { immediate: true },
  )

  // 当切换会话时，重置显示计数
  watch(
    () => currentSession.value?.id,
    (newSessionId, oldSessionId) => {
      // 如果会话被删除（从有值变为null），清空消息
      if (oldSessionId && !newSessionId) {
        chatFlowStore.clearMessages()
        currentSessionDisplayCount.value = 0
      }
      else {
        currentSessionDisplayCount.value = chatDisplayMessages.value.length
      }
    },
  )

  const handleEnterPress = async () => {
    const editor = editorRef.value?.editor
    if (!editor || isChatStreaming.value)
      return

    await handleSend()
  }

  const handleSessionSelected = async (sessionId: string) => {
    await chatSessionStore.setCurrentSession(sessionId)

    // 使用缓存加载会话的消息历史
    try {
      const messages = await chatSessionStore.loadMessagesWithCache(sessionId)
      chatFlowStore.loadMessagesFromHistory(messages)
    }
    catch (error) {
      console.error('加载会话消息失败:', error)
    }
  }

  const handleNewSession = async () => {
    try {
      // 先清空消息和重置状态，确保欢迎界面正确显示
      chatFlowStore.clearMessages()
      // 然后创建新会话
      await chatSessionStore.createNewSession()
    }
    catch (error) {
      console.error('创建新会话失败:', error)
    }
  }

  const toggleSidebar = () => {
    showSidebar.value = !showSidebar.value
  }

  // 菜单命令处理器
  const handleMenuNewSession = async () => {
    try {
      // 先清空消息和重置状态，确保欢迎界面正确显示
      chatFlowStore.clearMessages()
      // 然后创建新会话
      await chatSessionStore.createNewSession()
    }
    catch (error) {
      console.error('创建新会话失败:', error)
    }
  }

  const handleMenuEditTitle = async () => {
    try {
      if (!currentSession.value)
        return

      const prompt = usePrompt()
      const newTitle = await prompt({
        title: t('chat_session__edit_title'),
        message: t('chat_session__edit_title_prompt'),
        defaultValue: currentSession.value.title,
      })

      if (!newTitle || newTitle === currentSession.value.title)
        return

      await chatSessionStore.updateSessionTitle(currentSession.value.id, newTitle)
    }
    catch (error) {
      console.error('更新会话标题失败:', error)
    }
  }

  const handleMenuDeleteSession = async () => {
    try {
      if (!currentSession.value)
        return

      const confirm = useConfirm()
      const confirmed = await confirm({
        title: t('chat_session__delete'),
        message: t('chat_session__delete_confirm', { title: currentSession.value.title }),
        confirmText: t('common_confirm'),
        cancelText: t('common_cancel'),
      })

      if (!confirmed)
        return

      await chatSessionStore.deleteSession(currentSession.value.id)
    }
    catch (error) {
      console.error('删除会话失败:', error)
    }
  }

  const handleMenuClearHistory = async () => {
    try {
      const confirm = useConfirm()
      const confirmed = await confirm({
        title: t('chat_edit_clear_history'),
        message: '确定要清空当前对话历史吗？此操作不可撤销。',
        confirmText: t('common_confirm'),
        cancelText: t('common_cancel'),
      })

      if (!confirmed)
        return

      chatFlowStore.clearMessages()
    }
    catch (error) {
      console.error('清空对话历史失败:', error)
    }
  }

  // 监听菜单事件
  useEventListener(window, 'chat:toggleSidebar', toggleSidebar)
  useEventListener(window, 'chat:newSession', handleMenuNewSession)
  useEventListener(window, 'chat:editTitle', handleMenuEditTitle)
  useEventListener(window, 'chat:deleteSession', handleMenuDeleteSession)
  useEventListener(window, 'chat:clearHistory', handleMenuClearHistory)

  return vine`
    <div class="relative w-full h-full row-flex items-stretch bg-white dark:bg-zinc-950">
      <!-- 侧边栏 -->
      <div v-if="showSidebar" class="border-r border-zinc-200 dark:border-zinc-700">
        <ChatSessionSidebar
          :currentSessionId="currentSession?.id"
          :currentSessionMessageCount="currentSessionDisplayCount"
          @sessionSelected="handleSessionSelected"
          @newSession="handleNewSession"
        />
      </div>

      <!-- 主对话区域 -->
      <div class="flex-1 col-flex relative h-full">
        <!-- 顶部工具栏 -->
        <div
          class="row-flex items-center justify-between p-3 border-b border-zinc-200/50 dark:border-zinc-700/50 bg-zinc-50/50 dark:bg-zinc-900/50"
        >
          <div class="row-flex items-center gap-3">
            <button
              @click="toggleSidebar"
              class="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
              :title="t('chat_view_toggle_sidebar')"
            >
              <div class="i-lucide:sidebar text-lg text-zinc-600 dark:text-zinc-400" />
            </button>
            <div v-if="currentSession" class="text-sm text-zinc-600 dark:text-zinc-400">
              {{ currentSession.title }}
            </div>
          </div>
        </div>

        <!-- 欢迎界面 -->
        <div
          v-if="isShowGuide && chatDisplayMessages?.length === 0"
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
        <div v-else class="flex-1 w-full h-full overflow-y-auto">
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
            <div class="text-xs text-zinc-400 dark:text-zinc-500">
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

              <div v-else class="row-flex gap-2 justify-center flex-nowrap">
                <div class="i-lucide:send text-lg" />
                <div class="text-sm whitespace-nowrap">{{ t('chat_flow__send') }}</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
}
