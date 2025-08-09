export interface HonoResponse<T> {
  code: number
  message?: string
  data?: T
}
