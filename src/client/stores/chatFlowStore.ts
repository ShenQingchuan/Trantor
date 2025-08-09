import type { ChatCompletionTool } from 'openai/resources/index.mjs'
import type { Editor } from 'prosekit/core'
import type { ChatDisplayMessage, ChatFlowContext } from '../types/chatFlow'
import { useLocalStorage, useSessionStorage } from '@vueuse/core'
import { nanoid } from 'nanoid'
import { connectTrantorMcpServer, createChatFlowContext } from '../chatFlow/client'
import { createChatStream } from '../chatFlow/stream'
import { sleep } from '../utils/shared'

const chatFlowStoreId = 'trantor:chat-flow-store' as const

export const useChatFlowStore = defineStore(chatFlowStoreId, () => {
  const { t } = useI18n()
  const chatFlowAIContext = ref<ChatFlowContext>()
  const chatDisplayMessages = ref<ChatDisplayMessage[]>([])
  const chatLastPendingMessage = ref<ChatDisplayMessage | null>(null)
  const chatMcpSessionId = useSessionStorage('trantor:chat-flow-mcp-session-id', '')
  const chatMcpTools = useLocalStorage<ChatCompletionTool[] | null>(
    'trantor:chat-flow-mcp-tools',
    null,
    {
      serializer: {
        read: raw => JSON.parse(raw),
        write: value => JSON.stringify(value),
      },
    },
  )

  const editor = ref<Editor>()
  const isShowGuide = ref(true)
  const isChatStreaming = ref(false)

  const setEditor = (instance: Editor | undefined) => editor.value = instance

  const initChatFlowAIContext = async () => {
    chatFlowAIContext.value = await createChatFlowContext()
    await connectTrantorMcpServer()
  }

  const sendPrompt = async (prompt: string) => {
    if (!chatFlowAIContext.value) {
      throw new Error('MCP 服务未初始化成功，无法进行 AI 对话')
    }

    isChatStreaming.value = true
    isShowGuide.value = false

    chatDisplayMessages.value.push({
      id: nanoid(),
      content: prompt,
      role: 'user',
    })
    await sleep(1000)

    const stream = createChatStream(
      chatFlowAIContext.value,
      prompt,
      {
        onToolCall: (toolCall) => {
          const { toolId, toolName, toolArgs } = toolCall
          const newToolCall: ChatDisplayMessage = {
            id: toolId,
            content: t('chat_flow__display_message_tool_call', { toolName }),
            role: 'tool',
            args: toolArgs,
            pending: true,
          }
          chatDisplayMessages.value.push(newToolCall)
        },
        onToolResult: async (
          { toolId, toolName, result, isError },
        ) => {
          const toolCallMsg = chatDisplayMessages.value.find(
            (m): m is ChatDisplayMessage & { role: 'tool' } => (
              m.id === toolId && m.role === 'tool'
            ),
          )
          if (!toolCallMsg) {
            return
          }

          await nextTick()
          toolCallMsg.result = result
          toolCallMsg.pending = false
          toolCallMsg.isError = isError ?? false
          toolCallMsg.content = (
            isError
              ? t('chat_flow__display_message_tool_call_error', { toolName })
              : t('chat_flow__display_message_tool_call_result', { toolName })
          )
        },
      },
    )

    for await (const chunk of stream) {
      // 在文字流开始之后再插入一个 pending 状态的 assistant message
      if (!chatLastPendingMessage.value) {
        chatLastPendingMessage.value = {
          id: nanoid(),
          content: '',
          role: 'assistant',
        }
        chatDisplayMessages.value.push(
          chatLastPendingMessage.value,
        )
      }

      chatLastPendingMessage.value.content += chunk
      await sleep(50) // 模拟打字机效果
    }

    isChatStreaming.value = false
    chatLastPendingMessage.value = null
  }

  initChatFlowAIContext()

  return {
    chatFlowAIContext,
    chatMcpSessionId,
    chatMcpTools,
    chatDisplayMessages,
    editor,
    isShowGuide,
    isChatStreaming,
    sendPrompt,
    setEditor,
  }
})
