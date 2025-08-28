import { env } from 'node:process'
import OpenAI from 'openai'
import { createTrantorMiddleware } from '../utils/setup.js'

export const llmClientMiddleware = createTrantorMiddleware(async (c, next) => {
  const llmClient = new OpenAI({
    apiKey: env.LLM_API_KEY,
    baseURL: env.LLM_BASE_URL,
  })
  c.set('llmClient', llmClient)

  await next()
})
