export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function randomSkeletonWidth({
  base = 100,
  min = 40,
}: {
  base?: number // 系数
  min?: number // 最小值
} = {}) {
  return `${Math.max(Math.random() * base, min)}%`
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function getErrMsg(error: unknown) {
  return error instanceof Error
    ? error.message
    : String(error)
}
