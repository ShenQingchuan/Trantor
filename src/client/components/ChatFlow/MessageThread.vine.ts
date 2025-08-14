import type { ChatDisplayMessage, ChatFlowMessageFilter } from '../../types/chatFlow'
import { useChatFlowStore } from '../../stores/chatFlowStore'

function UserMessageBubble(props: {
  message: ChatDisplayMessage
}) {
  const { isChatStreaming } = storeToRefs(useChatFlowStore())

  return vine`
    <div v-motion-slide-visible-right class="bubble row-flex gap-4 items-center self-end">
      <div v-if="isChatStreaming" class="i-svg-spinners:pulse-multiple text-2xl text-slate-500" />
      <div
        class="row-flex bg-zinc-100 border-(1px solid zinc-200) rounded-md px-4 py-2 text-zinc-700"
      >
        {{ message.content }}
      </div>
      <div class="row-flex justify-center w-10 h-10 rounded-full bg-zinc-200:50 text-zinc-500">
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
        class="row-flex self-start justify-center w-6 h-6 rounded-full bg-slate-200:50 text-slate-500"
      >
        <div class="i-jam:tools text-sm" />
      </div>
      <div
        class="stack gap-2 rounded-md px-2 py-1 text-slate-700"
        :class="[
          message.isError
            ? 'bg-red-100 border-(1px solid red-200)'
            : 'bg-slate-100 border-(1px solid slate-200)',
        ]"
      >
        <div class="row-flex gap-2">
          <div v-if="message.pending" class="i-svg-spinners:90-ring-with-bg text-lg text-slate-500" />
          <div v-else class="i-line-md:clipboard-check text-lg text-slate-500" />
          <span>{{ message.content }}</span>
        </div>
        <details v-if="isShowArgs">
          <summary class="text-slate-400:80 cursor-pointer select-none">
            {{ t('chat_flow__tool_call_args') }}
          </summary>
          <pre class="text-slate-400:80 font-mono">{{ JSON.stringify(message.args, null, 2) }}</pre>
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
        class="row-flex self-start justify-center w-10 h-10 rounded-full bg-violet-200:50 text-violet-700"
      >
        <div class="i-lucide:bot text-xl" />
      </div>
      <div
        class="row-flex bg-violet-100 w-2/3 border-(1px solid violet-200) rounded-md px-4 py-2 text-zinc-900"
      >
        <div v-if="!message.content" class="row-flex gap-2 font-italic text-sm text-violet-500:40">
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
  return vine`
    <div class="stack gap-4 flex-1 pt-10 pb-50 px-20% flex-1 self-stretch">
      <!-- 已完成消息列表 -->
      <RenderMessages />
    </div>
  `
}
