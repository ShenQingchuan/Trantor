import type { Stream } from 'openai/core/streaming.mjs'
import type { ChatCompletionChunk } from 'openai/resources/index.mjs'
import type { ChatFlowContext, ChatStreamClientHooks, OpenAIToolCallData, StreamContext } from '../types/chatFlow'
import { attempt } from 'lodash-es'
import { fetchChatStream } from '../requests/chatFlow'

async function collectStreamToolCalls(
  streamContext: StreamContext,
  toolCalls: ChatCompletionChunk.Choice.Delta.ToolCall[],
) {
  // 从当前块中提取工具调用信息
  for (const toolCall of toolCalls) {
    // 确保缓存中存在对应的工具调用索引
    const index = toolCall.index
    streamContext.toolCalls[index] ??= {
      type: 'function',
      id: '',
      function: {
        name: '',
        arguments: '',
      },
    }

    const toolCallCache = streamContext.toolCalls[index]
    // 更新工具调用信息
    if (toolCall.id) {
      toolCallCache.id = toolCall.id
    }
    if (toolCall.function?.name) {
      toolCallCache.function.name = toolCall.function.name
    }
    if (toolCall.function?.arguments) {
      toolCallCache.function.arguments += toolCall.function.arguments
    }
  }
}

async function* handleStreamResult(
  context: ChatFlowContext,
  streamContext: StreamContext,
  stream: Stream<ChatCompletionChunk>,
) {
  let responseText = ''
  for await (const chunk of stream) {
    for (const choice of chunk.choices) {
      if (choice.delta?.content) {
        yield choice.delta.content
        responseText += choice.delta.content
      }
      else if (choice.delta?.tool_calls) {
        // 收集工具调用信息，但暂不处理
        await collectStreamToolCalls(streamContext, choice.delta.tool_calls)
      }
    }
  }

  // 处理收集到的工具调用，并以块的形式输出结果
  if (streamContext.toolCalls.length > 0) {
    for await (const chunk of streamProcessToolCalls(context, streamContext)) {
      yield chunk
    }
  }

  if (responseText.trim()) {
    context.messages.push({
      role: 'assistant',
      content: responseText,
    })
  }
}

async function* streamProcessToolCalls(
  chatFlowContext: ChatFlowContext,
  streamContext: StreamContext,
): AsyncGenerator<string> {
  const processedFuncIds = new Set<string>()
  const finishToolCall = ({
    toolCall,
    toolName,
    result,
    isError = false,
  }: {
    toolCall: OpenAIToolCallData
    toolName: string
    result: any
    isError?: boolean
  }) => {
    processedFuncIds.add(toolCall.id)
    streamContext.toolCalls.shift() // 缓存出队列
    streamContext.hooks?.onToolResult?.({
      toolId: toolCall.id,
      toolName,
      result,
      isError,
    })
  }

  let hasMoreToolCalls = false

  do {
    for (const toolCall of [...streamContext.toolCalls]) {
      if (processedFuncIds.has(toolCall.id)) {
        continue
      }

      if (!toolCall?.id || !toolCall.function.name) {
        continue
      }

      const toolArgs = attempt(() => JSON.parse(toolCall.function.arguments))
      if (!toolArgs) {
        throw new Error(`工具 ${toolCall.function.name} 调用参数解析失败: ${toolCall.function.arguments}`)
      }

      const toolName = toolCall.function.name
      const tool = chatFlowContext.tools.find(t => t.function.name === toolName)

      if (!tool || !toolArgs || !chatFlowContext.mcpClient) {
        continue
      }

      let result: any = null
      try {
        streamContext.hooks?.onToolCall?.({
          toolId: toolCall.id,
          toolName,
          toolArgs,
        })

        result = await chatFlowContext.mcpClient.callTool({
          name: toolName,
          arguments: toolArgs || {},
        })

        chatFlowContext.messages.push({
          role: 'assistant',
          content: null,
          tool_calls: [{
            id: toolCall.id,
            type: toolCall.type,
            function: {
              name: toolCall.function.name,
              arguments: toolCall.function.arguments,
            },
          }],
        })

        chatFlowContext.messages.push({
          role: 'tool',
          content: JSON.stringify(result.content),
          tool_call_id: toolCall.id,
        })

        finishToolCall({ toolCall, toolName, result })

        if (streamContext.toolCalls.length > 0) {
          // 一轮对话可能产生多个工具调用，
          // 还有些工具调用需要处理
          hasMoreToolCalls = true
          continue
        }
        else {
          hasMoreToolCalls = false
        }

        // 使用之前的消息（可能包含工具调用及其结果）
        // 生成下一个文本响应
        const nextStream = await fetchChatStream(
          chatFlowContext.messages,
          chatFlowContext.tools,
        )

        for await (const chunk of handleStreamResult(
          chatFlowContext,
          streamContext,
          nextStream,
        )) {
          yield chunk
        }
      }
      catch (error) {
        console.error(`工具调用失败: ${toolName}`, error)
        finishToolCall({ toolCall, toolName, result: null, isError: true })
      }
    }
  } while (hasMoreToolCalls)
}

export function createChatStream(
  context: ChatFlowContext,
  prompt: string,
  hooks: ChatStreamClientHooks,
) {
  const streamContext: StreamContext = {
    toolCalls: [],
    hooks,
  }

  return (async function* () {
    if (!prompt.length) {
      return
    }

    context.messages.push({ role: 'user', content: prompt })

    const stream = await fetchChatStream(
      context.messages,
      context.tools,
    )

    try {
      for await (const chunk of handleStreamResult(
        context,
        streamContext,
        stream,
      )) {
        yield chunk
      }
    }
    finally {
      // 当流结束时清除缓存
      streamContext.toolCalls = []
      await context.transport?.close()
    }
  })()
}
