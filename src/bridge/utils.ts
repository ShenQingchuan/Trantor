export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function getErrMsg(error: unknown) {
  return error instanceof Error
    ? error.message
    : String(error)
}
