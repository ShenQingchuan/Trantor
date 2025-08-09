import type { ChatRequestBody } from '../../../bridge/types/chatFlow.js'
import { env } from 'node:process'
import { streamSSE } from 'hono/streaming'
import { handlerFactory } from '../handler-factory.js'

export const handleChatCompletionsRequest = handlerFactory.createHandlers(async (c) => {
  const body = await c.req.json() as ChatRequestBody
  const { messages, tools } = body
  const llmClient = c.get('llmClient')

  const llmRespStream = await llmClient.chat.completions.create({
    model: env.LLM_MODEL_NAME || 'deepseek-chat',
    messages,
    tools,
    stream: true,
  })

  const abortController = new AbortController()
  return streamSSE(
    c,
    async (stream) => {
      stream.onAbort(() => abortController.abort())
      for await (const it of llmRespStream) {
        if (abortController.signal.aborted) {
          throw new Error('[Trantor LLM] 请求被终止')
        }
        stream.writeSSE({ data: JSON.stringify(it) })
      }
    },
    async (err, stream) => {
      await stream.writeSSE({
        data: JSON.stringify({
          error: err.message,
        }),
      })
      return stream.close()
    },
  )
})
