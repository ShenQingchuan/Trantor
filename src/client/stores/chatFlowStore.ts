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

    // 创建用户消息，设置为流式状态
    let userMessage: ChatDisplayMessage = {
      id: nanoid(),
      content: prompt,
      role: 'user',
      streaming: true,
    }
    chatDisplayMessages.value.push(userMessage)
    userMessage = chatDisplayMessages.value[chatDisplayMessages.value.length - 1] // 更新引用为响应式 Proxy

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

    let hasContent = false
    for await (const chunk of stream) {
      if (userMessage.streaming) {
        userMessage.streaming = false
      }

      hasContent = true
      
      // 当收到第一个文本块时，才创建 assistant 消息
      if (!chatLastPendingMessage.value) {
        chatLastPendingMessage.value = {
          id: nanoid(),
          content: '',
          role: 'assistant',
          streaming: true,
        }
        chatDisplayMessages.value.push(chatLastPendingMessage.value)
      }
      
      chatLastPendingMessage.value.content += chunk
      await sleep(50) // 模拟打字机效果
    }

    // 结束流式状态
    if (chatLastPendingMessage.value) {
      chatLastPendingMessage.value.streaming = false
    }

    // 如果没有任何内容，移除空的 assistant 消息
    if (!hasContent && chatLastPendingMessage.value?.content === '') {
      const index = chatDisplayMessages.value.findIndex(m => m.id === chatLastPendingMessage.value?.id)
      if (index !== -1) {
        chatDisplayMessages.value.splice(index, 1)
      }
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
