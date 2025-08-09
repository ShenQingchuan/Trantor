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
