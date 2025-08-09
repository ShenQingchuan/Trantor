import type { StaffInfo as FtoaStaffInfo } from '@futu/ftoa'

export type StaffInfo = Pick<
  FtoaStaffInfo,
  'id' | 'nick' | 'name' | 'state' | 'feishuOpenId' | 'avatarUrl' | 'leaderId'
>

// 当前登录用户信息类型
export interface CurrentUser {
  id: number
  nick: string
  name: string
  email?: string
  avatarUrl?: string
}
