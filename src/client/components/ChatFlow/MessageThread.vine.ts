import type { ChatDisplayMessage, ChatFlowMessageFilter } from '../../types/chatFlow'
import { useChatFlowStore } from '../../stores/chatFlowStore'
import { useChatSessionStore } from '../../stores/chatSessionStore'

function UserMessageBubble(props: {
  message: ChatDisplayMessage
}) {
  return vine`
    <div v-motion-slide-visible-right class="bubble row-flex gap-4 items-center self-end">
      <div v-if="message.streaming" class="i-svg-spinners:pulse-multiple text-2xl text-slate-500" />
      <div
        class="row-flex dark:text-white bg-zinc-100 dark:bg-zinc-800 border-(1px solid zinc-200) dark:border-zinc-700 rounded-md px-4 py-2 text-zinc-700"
      >
        {{ message.content }}
      </div>
      <div
        class="row-flex justify-center w-10 h-10 rounded-full bg-zinc-200:50 dark:bg-zinc-700:50 text-zinc-500 dark:text-zinc-400"
      >
        <div class="i-lucide:user-round text-2xl" />
      </div>
    </div>
  `
}

function ToolCallBubble(props: {
  message: ChatDisplayMessage & { role: 'tool' }
}) {
  const { t } = useI18n()
  const isShowArgs = computed(() => Object.keys(props.message.args).length > 0)

  return vine`
    <div class="bubble text-xs row-flex gap-2 items-center self-start">
      <div
        class="row-flex self-start justify-center w-6 h-6 rounded-full bg-slate-200:50 dark:bg-slate-700:50 text-slate-500 dark:text-slate-400"
      >
        <div class="i-jam:tools text-sm" />
      </div>
      <div
        class="col-flex gap-2 rounded-md px-2 py-1 text-slate-700 dark:text-slate-300"
        :class="[
          message.isError
            ? 'bg-red-100 dark:bg-red-900/50 border-(1px solid red-200) dark:border-red-700'
            : 'bg-slate-100 dark:bg-slate-800/50 border-(1px solid slate-200) dark:border-slate-700',
        ]"
      >
        <div class="row-flex gap-2">
          <div v-if="message.pending" class="i-svg-spinners:90-ring-with-bg text-lg text-slate-500" />
          <div v-else class="i-line-md:clipboard-check text-lg text-slate-500 dark:text-slate-400" />
          <span>{{ message.content }}</span>
        </div>
        <details v-if="isShowArgs">
          <summary class="text-slate-400:80 dark:text-slate-500:80 cursor-pointer select-none">
            {{ t('chat_flow__tool_call_args') }}
          </summary>
          <pre class="text-slate-400:80 dark:text-slate-500:80 font-mono">{{
            JSON.stringify(message.args, null, 2)
          }}</pre>
        </details>
      </div>
    </div>
  `
}

function AssistantMessageBubble(props: {
  message: ChatDisplayMessage & { role: 'assistant' }
}) {
  return vine`
    <div v-motion-slide-visible-left class="bubble w-full row-flex gap-4 items-center self-start">
      <div
        class="row-flex self-start justify-center w-10 h-10 flex-shrink-0 rounded-full bg-violet-200:50 dark:bg-violet-700:50 text-violet-700 dark:text-violet-400"
      >
        <div class="i-lucide:bot text-xl" />
      </div>
      <div
        class="row-flex bg-violet-100 dark:bg-violet-800/50 border-(1px solid violet-200) dark:border-violet-700 rounded-md px-4 py-2 text-zinc-900 dark:text-zinc-100"
      >
        <div
          v-if="!message.content"
          class="row-flex gap-2 font-italic text-sm text-violet-500:40 dark:text-violet-400:40"
        >
          <div class="i-svg-spinners:bars-scale-fade text-2xl" />
        </div>
        <pre v-else class="row-flex whitespace-pre-line font-sans">{{ message.content }}</pre>
      </div>
    </div>
  `
}

function RenderMessages(props: {
  filter?: ChatFlowMessageFilter
}) {
  const { chatDisplayMessages } = storeToRefs(useChatFlowStore())

  return vine`
    <template v-for="message in chatDisplayMessages" :key="message.id">
      <UserMessageBubble v-if="message.role === 'user'" :message="message" />
      <ToolCallBubble v-if="message.role === 'tool'" :message="message" />
      <AssistantMessageBubble v-if="message.role === 'assistant'" :message="message" />
    </template>
  `
}

export function MessageThread() {
  const chatSessionStore = useChatSessionStore()
  const { isLoadingMessages } = storeToRefs(chatSessionStore)
  const { t } = useI18n()

  return vine`
    <div
      class="w-full h-full flex-1 col-flex gap-4 overflow-auto py-6 flex-1 px-10% self-stretch pb-200px"
    >
      <div
        v-if="isLoadingMessages"
        class="w-full h-full col-flex gap-2 items-center justify-center flex-1"
      >
        <div class="row-flex gap-2 items-center text-slate-500">
          <div class="i-svg-spinners:bars-fade text-2xl" />
          {{ t('chat_loading_messages') }}
        </div>
      </div>
      <RenderMessages v-else />
    </div>
  `
}
