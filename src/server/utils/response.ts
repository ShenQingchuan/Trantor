import type { Context } from 'hono'
import type { StatusCode } from 'hono/utils/http-status'

export function successResponse<D = unknown>(
  c: Context,
  data: D,
  message?: string,
) {
  return c.json({
    code: 0,
    data,
    message,
  })
}

export function errorResponse<D = unknown>(
  c: Context,
  code: StatusCode,
  message: string,
  data?: D,
) {
  c.status(code)
  return c.json({
    code,
    data,
    message,
  })
}
