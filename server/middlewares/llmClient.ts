import { env } from 'node:process'
import OpenAI from 'openai'
import { createTrantorMiddleware } from '../utils/setup.js'

const llmClient = new OpenAI({
  apiKey: env.LLM_API_KEY,
  baseURL: env.LLM_BASE_URL,
})

export const llmClientMiddleware = createTrantorMiddleware(async (c, next) => {
  c.set('llmClient', llmClient)
  await next()
})
