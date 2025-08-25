import type { AuthenticatedUser, AuthToken, OSConfig, UserPermission } from '../../../bridge/types/auth.js'
import process from 'node:process'
import { nanoid } from 'nanoid'
import { MYOS_APPS } from '../../constants/myos-apps.js'

// Simple in-memory storage (can be replaced with database later)
class AuthStorage {
  private users = new Map<string, AuthenticatedUser>()
  private tokens = new Map<string, AuthToken>()
  private config: OSConfig

  constructor() {
    // Initialize with default configuration
    this.config = {
      apps: this.getDefaultApps(),
      allowPublicAccess: false,
      requireTokenForChat: true,
      maxTokensPerUser: 5,
      defaultTokenExpiry: 30, // 30 days
    }

    // Initialize owner account
    this.initializeOwner()
  }

  private getDefaultApps() {
    return MYOS_APPS
  }

  private initializeOwner() {
    const ownerId = 'owner'
    const ownerUser: AuthenticatedUser = {
      id: ownerId,
      username: 'owner',
      displayName: 'System Owner',
      role: 'owner',
      createdAt: new Date(),
      lastActiveAt: new Date(),
      tokens: [],
      permissions: this.generateOwnerPermissions(),
    }
    this.users.set(ownerId, ownerUser)

    // 为开发环境创建永不过期的token
    if (process.env.NODE_ENV === 'development') {
      this.createDevelopmentToken(ownerId)
    }
  }

  private createDevelopmentToken(userId: string) {
    const devToken: AuthToken = {
      token: `dev-token-${nanoid(16)}`, // 可预测的前缀便于调试
      userId,
      name: 'Development Token (永不过期)',
      permissions: this.generateOwnerPermissions(),
      createdAt: new Date(),
      expiresAt: new Date(2099, 12, 31), // 永远不会过期的日期
    }

    this.tokens.set(devToken.token, devToken)

    const user = this.users.get(userId)
    if (user) {
      user.tokens.push(devToken)
    }

    console.log(`🚀 开发环境Token已创建: ${devToken.token}`)
    console.log(`   在浏览器控制台执行以下代码自动登录:`)
    console.log(`   localStorage.setItem('trantor:auth-token', '${devToken.token}')`)
  }

  private generateOwnerPermissions(): UserPermission[] {
    const permissions: UserPermission[] = []
    const now = new Date()

    this.config.apps.forEach((app) => {
      app.permissions.forEach((permission) => {
        permissions.push({
          userId: 'owner',
          appId: app.id,
          permissionId: permission.id,
          grantedAt: now,
          grantedBy: 'system',
        })
      })
    })

    return permissions
  }

  // User management
  getUserById(id: string): AuthenticatedUser | undefined {
    return this.users.get(id)
  }

  getUserByUsername(username: string): AuthenticatedUser | undefined {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user
      }
    }
    return undefined
  }

  createUser(userData: Omit<AuthenticatedUser, 'id' | 'createdAt' | 'lastActiveAt' | 'tokens' | 'permissions'>): AuthenticatedUser {
    const user: AuthenticatedUser = {
      ...userData,
      id: nanoid(),
      createdAt: new Date(),
      lastActiveAt: new Date(),
      tokens: [],
      permissions: [],
    }
    this.users.set(user.id, user)
    return user
  }

  updateUserLastActive(userId: string): void {
    const user = this.users.get(userId)
    if (user) {
      user.lastActiveAt = new Date()
    }
  }

  // Token management
  createToken(userId: string, name: string, permissions: UserPermission[], expiryDays?: number): AuthToken {
    const token: AuthToken = {
      token: nanoid(32),
      userId,
      name,
      permissions,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + (expiryDays || this.config.defaultTokenExpiry) * 24 * 60 * 60 * 1000),
    }

    this.tokens.set(token.token, token)

    // Add token to user
    const user = this.users.get(userId)
    if (user) {
      user.tokens.push(token)
      // Limit number of tokens per user
      if (user.tokens.length > this.config.maxTokensPerUser) {
        const oldestToken = user.tokens.shift()
        if (oldestToken) {
          this.tokens.delete(oldestToken.token)
        }
      }
    }

    return token
  }

  getTokenByValue(tokenValue: string): AuthToken | undefined {
    const token = this.tokens.get(tokenValue)
    if (token && token.expiresAt > new Date()) {
      return token
    }
    if (token && token.expiresAt <= new Date()) {
      // Clean up expired token
      this.tokens.delete(tokenValue)
      const user = this.users.get(token.userId)
      if (user) {
        user.tokens = user.tokens.filter(t => t.token !== tokenValue)
      }
    }
    return undefined
  }

  revokeToken(tokenValue: string): boolean {
    const token = this.tokens.get(tokenValue)
    if (token) {
      this.tokens.delete(tokenValue)
      const user = this.users.get(token.userId)
      if (user) {
        user.tokens = user.tokens.filter(t => t.token !== tokenValue)
      }
      return true
    }
    return false
  }

  // Permission management
  hasPermission(userId: string, appId: string, permissionId: string): boolean {
    const user = this.users.get(userId)
    if (!user)
      return false

    return user.permissions.some(p =>
      p.userId === userId
      && p.appId === appId
      && p.permissionId === permissionId
      && (!p.expiresAt || p.expiresAt > new Date()),
    )
  }

  grantPermission(userId: string, appId: string, permissionId: string, grantedBy: string, expiresAt?: Date): boolean {
    const user = this.users.get(userId)
    if (!user)
      return false

    // Check if permission already exists
    const existingPermission = user.permissions.find(p =>
      p.userId === userId && p.appId === appId && p.permissionId === permissionId,
    )

    if (existingPermission) {
      // Update expiration if needed
      if (expiresAt) {
        existingPermission.expiresAt = expiresAt
      }
      return true
    }

    const permission: UserPermission = {
      userId,
      appId,
      permissionId,
      grantedAt: new Date(),
      grantedBy,
      expiresAt,
    }

    user.permissions.push(permission)
    return true
  }

  revokePermission(userId: string, appId: string, permissionId: string): boolean {
    const user = this.users.get(userId)
    if (!user)
      return false

    const initialLength = user.permissions.length
    user.permissions = user.permissions.filter(p =>
      !(p.userId === userId && p.appId === appId && p.permissionId === permissionId),
    )

    return user.permissions.length < initialLength
  }

  // App and config management
  getApps() {
    return this.config.apps
  }

  getApp(appId: string) {
    return this.config.apps.find(app => app.id === appId)
  }

  getConfig() {
    return this.config
  }

  updateConfig(updates: Partial<OSConfig>) {
    this.config = { ...this.config, ...updates }
  }
}

// Singleton instance
export const authStorage = new AuthStorage()
