export type WindowId = string

export interface AppWindowState {
  id: WindowId
  appId: string
  title: string
  icon?: string
  isActive: boolean
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  width: number
  height: number
  x: number
  y: number
}

export interface OpenWindowOptions {
  appId: string
  title: string
  icon?: string
  initial?: Partial<Pick<AppWindowState, 'width' | 'height' | 'x' | 'y'>>
}
