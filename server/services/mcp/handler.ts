import { handlerFactory } from '../handler-factory.js'

export const handleMcpRequest = handlerFactory.createHandlers(async (c) => {
  const { transport } = c.get('mcpServer')
  return transport.handleRequest(c)
})
