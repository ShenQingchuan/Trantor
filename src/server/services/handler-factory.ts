import type { ServerContext } from '../types/index.js'
import { createFactory } from 'hono/factory'

export const handlerFactory = createFactory<ServerContext>()
