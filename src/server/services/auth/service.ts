import type { AuthenticatedUser, AuthResponse, LoginRequest, PermissionCheckRequest, UserPermission } from '../../../bridge/types/auth.js'
import process from 'node:process'
import { authStorage } from './storage.js'

export class AuthService {
  /**
   * Authenticate user with token or username/password
   */
  async authenticate(request: LoginRequest): Promise<AuthResponse> {
    try {
      // Token-based authentication
      if (request.token) {
        const token = authStorage.getTokenByValue(request.token)
        if (token) {
          const user = authStorage.getUserById(token.userId)
          if (user) {
            authStorage.updateUserLastActive(user.id)
            return {
              success: true,
              user,
              token: token.token,
              permissions: token.permissions,
            }
          }
        }
        return {
          success: false,
          message: 'Invalid or expired token',
        }
      }

      // Username/password authentication (for owner only)
      if (request.username && request.password) {
        // Simple password check for owner (in production, use proper hashing)
        if (request.username === 'owner' && request.password === process.env.OWNER_PASSWORD) {
          const user = authStorage.getUserByUsername('owner')
          if (user) {
            authStorage.updateUserLastActive(user.id)

            // Create a temporary session token
            const sessionToken = authStorage.createToken(
              user.id,
              'Session Token',
              user.permissions,
              1, // 1 day expiry
            )

            return {
              success: true,
              user,
              token: sessionToken.token,
              permissions: user.permissions,
            }
          }
        }
        return {
          success: false,
          message: 'Invalid username or password',
        }
      }

      return {
        success: false,
        message: 'No valid authentication method provided',
      }
    }
    catch (error) {
      console.error('Authentication error:', error)
      return {
        success: false,
        message: 'Authentication failed',
      }
    }
  }

  /**
   * Verify if user has specific permission
   */
  checkPermission(request: PermissionCheckRequest): boolean {
    return authStorage.hasPermission(request.userId, request.appId, request.permissionId)
  }

  /**
   * Get user by token
   */
  getUserByToken(token: string): AuthenticatedUser | null {
    const tokenData = authStorage.getTokenByValue(token)
    if (tokenData) {
      const user = authStorage.getUserById(tokenData.userId)
      if (user) {
        authStorage.updateUserLastActive(user.id)
        return user
      }
    }
    return null
  }

  /**
   * Create a new access token for a user
   */
  createAccessToken(userId: string, tokenName: string, appPermissions: { appId: string, permissionIds: string[] }[], expiryDays?: number): string | null {
    const user = authStorage.getUserById(userId)
    if (!user)
      return null

    // Build permission list based on requested permissions
    const permissions: UserPermission[] = []
    const grantedBy = user.id

    for (const appPerm of appPermissions) {
      for (const permissionId of appPerm.permissionIds) {
        // Verify user has permission to grant this
        if (user.role === 'owner' || authStorage.hasPermission(userId, appPerm.appId, permissionId)) {
          permissions.push({
            userId,
            appId: appPerm.appId,
            permissionId,
            grantedAt: new Date(),
            grantedBy,
          })
        }
      }
    }

    if (permissions.length === 0)
      return null

    const token = authStorage.createToken(userId, tokenName, permissions, expiryDays)
    return token.token
  }

  /**
   * Revoke an access token
   */
  revokeAccessToken(token: string): boolean {
    return authStorage.revokeToken(token)
  }

  /**
   * Get all available apps
   */
  getAvailableApps() {
    return authStorage.getApps()
  }

  /**
   * Get user's permissions for a specific app
   */
  getUserAppPermissions(userId: string, appId: string): UserPermission[] {
    const user = authStorage.getUserById(userId)
    if (!user)
      return []

    return user.permissions.filter(p =>
      p.userId === userId
      && p.appId === appId
      && (!p.expiresAt || p.expiresAt > new Date()),
    )
  }

  /**
   * Grant permission to user (owner only)
   */
  grantPermission(granterId: string, userId: string, appId: string, permissionId: string, expiresAt?: Date): boolean {
    const granter = authStorage.getUserById(granterId)
    if (!granter || granter.role !== 'owner')
      return false

    return authStorage.grantPermission(userId, appId, permissionId, granterId, expiresAt)
  }

  /**
   * Create a guest user with limited permissions
   */
  createGuestUser(guestName: string, allowedApps: string[]): { user: AuthenticatedUser, token: string } | null {
    const user = authStorage.createUser({
      username: `guest_${Date.now()}`,
      displayName: guestName,
      role: 'guest',
    })

    // Grant basic permissions for allowed apps
    const permissions: UserPermission[] = []
    for (const appId of allowedApps) {
      const app = authStorage.getApp(appId)
      if (app) {
        // Grant only required permissions for guests
        const requiredPermissions = app.permissions.filter(p => p.required)
        for (const permission of requiredPermissions) {
          authStorage.grantPermission(user.id, appId, permission.id, 'system')
          permissions.push({
            userId: user.id,
            appId,
            permissionId: permission.id,
            grantedAt: new Date(),
            grantedBy: 'system',
          })
        }
      }
    }

    // Create access token
    const token = authStorage.createToken(user.id, 'Guest Access', permissions, 1) // 1 day expiry

    return {
      user,
      token: token.token,
    }
  }

  /**
   * Get system configuration
   */
  getSystemConfig() {
    return authStorage.getConfig()
  }

  /**
   * Update system configuration (owner only)
   */
  updateSystemConfig(updaterId: string, updates: Partial<typeof authStorage.getConfig>): boolean {
    const updater = authStorage.getUserById(updaterId)
    if (!updater || updater.role !== 'owner')
      return false

    authStorage.updateConfig(updates)
    return true
  }
}

// Singleton instance
export const authService = new AuthService()
