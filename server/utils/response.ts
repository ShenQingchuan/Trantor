export function successResponse<D = unknown>(data: D, message?: string) {
  return {
    code: 0,
    data,
    message,
  }
}

export function errorResponse<D = unknown>(code: number, message: string, data?: D) {
  return {
    code,
    data,
    message,
  }
}
