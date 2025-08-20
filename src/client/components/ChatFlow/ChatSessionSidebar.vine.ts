import type { ChatFlowSession } from '../../../bridge/types/chatFlow'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useChatSessionStore } from '../../stores/chatSessionStore'
import { useConfirm, usePrompt } from '../Dialog.vine'

export function ChatSessionSidebar(props: {
  currentSessionId?: string
  currentSessionMessageCount?: number
}) {
  const emits = vineEmits<{
    sessionSelected: [sessionId: string]
    newSession: []
  }>()

  const { t } = useI18n()
  const chatSessionStore = useChatSessionStore()
  const { sessions, currentSession, isLoading } = storeToRefs(chatSessionStore)
  const confirm = useConfirm()
  const prompt = usePrompt()

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: zhCN,
    })
  }

  const getDisplayMessageCount = (session: ChatFlowSession) => {
    // 如果是当前会话且有实时计数，使用实时计数
    if (session.id === props.currentSessionId && props.currentSessionMessageCount !== undefined) {
      return props.currentSessionMessageCount
    }
    // 否则使用存储的计数
    return session.message_count || 0
  }

  const handleSelectSession = (session: ChatFlowSession) => {
    emits('sessionSelected', session.id)
  }

  const handleCreateNewSession = () => {
    emits('newSession')
  }

  const handleDeleteSession = async (session: ChatFlowSession, event: Event) => {
    event.stopPropagation()
    const confirmed = await confirm({
      title: t('chat_session__delete'),
      message: t('chat_session__delete_confirm', { title: session.title }),
    })
    if (confirmed) {
      chatSessionStore.deleteSession(session.id)
    }
  }

  const handleEditTitle = async (session: ChatFlowSession, event: Event) => {
    event.stopPropagation()
    const newTitle = await prompt({
      title: t('chat_session__edit_title'),
      message: t('chat_session__edit_title_prompt'),
      defaultValue: session.title,
    })
    if (newTitle && newTitle !== session.title) {
      chatSessionStore.updateSessionTitle(session.id, newTitle)
    }
  }

  const handleSummarizeSession = async (session: ChatFlowSession, event: Event) => {
    event.stopPropagation()
    try {
      // 使用 store 中的方法生成标题
      await chatSessionStore.generateSessionTitleManually(session.id)
    }
    catch (error) {
      console.error('手动生成标题失败:', error)
      // 这里可以添加一个提示，但为了简单起见，暂时只打印错误
    }
  }

  return vine`
    <div
      class="min-w-180px h-full bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700 col-flex"
    >
      <!-- 顶部标题栏 -->
      <div
        class="row-flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700"
      >
        <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
          {{ t('chat_session__title') }}
        </h2>
        <button
          @click="handleCreateNewSession"
          :disabled="isLoading"
          class="row-flex items-center gap-2 px-3 py-1.5 text-sm bg-violet-500 hover:bg-violet-600 text-white rounded-md transition-colors disabled:opacity-50"
        >
          <div class="i-lucide:plus text-sm" />
          {{ t('chat_session__new') }}
        </button>
      </div>

      <!-- 会话列表 -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="isLoading" class="row-flex justify-center gap-2 p-4 text-center text-zinc-500">
          <div class="i-svg-spinners:pulse-multiple" />
          <div class="text-sm">{{ t('chat_session__loading') }}</div>
        </div>

        <div
          v-else-if="sessions?.length === 0"
          class="row-flex justify-center gap-2 p-4 text-center text-zinc-500"
        >
          <div class="i-lucide:message-circle" />
          <div class="text-sm">{{ t('chat_session__empty') }}</div>
        </div>

        <div v-else class="p-2">
          <div
            v-for="session in sessions"
            :key="session.id"
            @click="handleSelectSession(session)"
            class="group row-flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            :class="[
              currentSession?.id === session.id
                ? 'bg-violet-100 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700'
                : 'border border-transparent',
            ]"
          >
            <!-- 会话信息 -->
            <div class="flex-1 min-w-0">
              <div class="row-flex items-center gap-2 mb-1">
                <h3 class="font-medium text-zinc-800 dark:text-zinc-200 truncate text-sm">
                  {{ session.title }}
                </h3>
                <div
                  class="row-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <button
                    @click="handleEditTitle(session, $event)"
                    class="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
                    :title="t('chat_session__edit_title')"
                  >
                    <div class="i-material-symbols:edit-note-outline dark:text-light text-dark" />
                  </button>
                  <button
                    @click="handleDeleteSession(session, $event)"
                    class="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                    :title="t('chat_session__delete')"
                  >
                    <div class="i-lucide:trash-2 text-rose-500" />
                  </button>
                  <button
                    @click="handleSummarizeSession(session, $event)"
                    class="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                    :title="t('chat_session__summarize')"
                    :disabled="chatSessionStore.getSessionUIState(session.id).isSummarizing"
                  >
                    <div
                      v-if="chatSessionStore.getSessionUIState(session.id).isSummarizing"
                      class="i-svg-spinners:3-dots-scale text-blue-500"
                    />
                    <div v-else class="i-fa6-solid:wand-magic-sparkles text-blue-500" />
                  </button>
                </div>
              </div>
              <div class="row-flex items-center gap-2 text-xs text-zinc-500">
                <span>{{ getDisplayMessageCount(session) }} 条消息</span>
                <span>·</span>
                <span>{{ formatTime(session.last_message_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}
