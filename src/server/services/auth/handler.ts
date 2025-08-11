import type { Context } from 'hono'
import type { LoginRequest } from '../../../bridge/types/auth.js'
import type { ServerContext } from '../../types/index.js'
import { authService } from './service.js'

export class AuthHandler {
  /**
   * Handle login request
   * POST /api/auth/login
   */
  async login(c: Context<ServerContext>) {
    try {
      const body = await c.req.json() as LoginRequest
      const result = await authService.authenticate(body)

      if (result.success) {
        return c.json(result)
      }
      else {
        return c.json(result, 401)
      }
    }
    catch (error) {
      console.error('Login error:', error)
      return c.json({
        success: false,
        message: 'Invalid request format',
      }, 400)
    }
  }

  /**
   * Get current user info
   * GET /api/auth/me
   */
  async getCurrentUser(c: Context<ServerContext>) {
    const user = c.get('currentUser')

    if (!user) {
      return c.json({
        success: false,
        message: 'Not authenticated',
      }, 401)
    }

    return c.json({
      success: true,
      user,
    })
  }

  /**
   * Get available apps and their permissions
   * GET /api/auth/apps
   */
  async getApps(c: Context<ServerContext>) {
    try {
      const apps = authService.getAvailableApps()
      return c.json({
        success: true,
        apps,
      })
    }
    catch (error) {
      console.error('Get apps error:', error)
      return c.json({
        success: false,
        message: 'Failed to fetch apps',
      }, 500)
    }
  }

  /**
   * Get user's permissions for a specific app
   * GET /api/auth/permissions/:appId
   */
  async getUserPermissions(c: Context<ServerContext>) {
    const user = c.get('currentUser')
    const appId = c.req.param('appId')

    if (!user) {
      return c.json({
        success: false,
        message: 'Not authenticated',
      }, 401)
    }

    if (!appId) {
      return c.json({
        success: false,
        message: 'App ID required',
      }, 400)
    }

    try {
      const permissions = authService.getUserAppPermissions(user.id, appId)
      return c.json({
        success: true,
        permissions,
      })
    }
    catch (error) {
      console.error('Get permissions error:', error)
      return c.json({
        success: false,
        message: 'Failed to fetch permissions',
      }, 500)
    }
  }

  /**
   * Create a new access token
   * POST /api/auth/tokens
   */
  async createToken(c: Context<ServerContext>) {
    const user = c.get('currentUser')

    if (!user) {
      return c.json({
        success: false,
        message: 'Not authenticated',
      }, 401)
    }

    try {
      const body = await c.req.json() as {
        name: string
        permissions: Array<{ appId: string, permissionIds: string[] }>
        expiryDays?: number
      }

      if (!body.name || !body.permissions) {
        return c.json({
          success: false,
          message: 'Token name and permissions required',
        }, 400)
      }

      const token = authService.createAccessToken(
        user.id,
        body.name,
        body.permissions,
        body.expiryDays,
      )

      if (!token) {
        return c.json({
          success: false,
          message: 'Failed to create token - insufficient permissions',
        }, 403)
      }

      return c.json({
        success: true,
        token,
        message: 'Token created successfully',
      })
    }
    catch (error) {
      console.error('Create token error:', error)
      return c.json({
        success: false,
        message: 'Invalid request format',
      }, 400)
    }
  }

  /**
   * Revoke an access token
   * DELETE /api/auth/tokens/:token
   */
  async revokeToken(c: Context<ServerContext>) {
    const user = c.get('currentUser')
    const tokenToRevoke = c.req.param('token')

    if (!user) {
      return c.json({
        success: false,
        message: 'Not authenticated',
      }, 401)
    }

    if (!tokenToRevoke) {
      return c.json({
        success: false,
        message: 'Token required',
      }, 400)
    }

    try {
      const success = authService.revokeAccessToken(tokenToRevoke)

      if (success) {
        return c.json({
          success: true,
          message: 'Token revoked successfully',
        })
      }
      else {
        return c.json({
          success: false,
          message: 'Token not found or already revoked',
        }, 404)
      }
    }
    catch (error) {
      console.error('Revoke token error:', error)
      return c.json({
        success: false,
        message: 'Failed to revoke token',
      }, 500)
    }
  }

  /**
   * Create guest access (owner only)
   * POST /api/auth/guest
   */
  async createGuestAccess(c: Context<ServerContext>) {
    const user = c.get('currentUser')

    if (!user || user.role !== 'owner') {
      return c.json({
        success: false,
        message: 'Owner access required',
      }, 403)
    }

    try {
      const body = await c.req.json() as {
        guestName: string
        allowedApps: string[]
      }

      if (!body.guestName || !body.allowedApps) {
        return c.json({
          success: false,
          message: 'Guest name and allowed apps required',
        }, 400)
      }

      const result = authService.createGuestUser(body.guestName, body.allowedApps)

      if (!result) {
        return c.json({
          success: false,
          message: 'Failed to create guest access',
        }, 500)
      }

      return c.json({
        success: true,
        user: result.user,
        token: result.token,
        message: 'Guest access created successfully',
      })
    }
    catch (error) {
      console.error('Create guest error:', error)
      return c.json({
        success: false,
        message: 'Invalid request format',
      }, 400)
    }
  }

  /**
   * Get system configuration (owner only)
   * GET /api/auth/config
   */
  async getConfig(c: Context<ServerContext>) {
    const user = c.get('currentUser')

    if (!user || user.role !== 'owner') {
      return c.json({
        success: false,
        message: 'Owner access required',
      }, 403)
    }

    try {
      const config = authService.getSystemConfig()
      return c.json({
        success: true,
        config,
      })
    }
    catch (error) {
      console.error('Get config error:', error)
      return c.json({
        success: false,
        message: 'Failed to fetch configuration',
      }, 500)
    }
  }

  /**
   * Update system configuration (owner only)
   * PUT /api/auth/config
   */
  async updateConfig(c: Context<ServerContext>) {
    const user = c.get('currentUser')

    if (!user || user.role !== 'owner') {
      return c.json({
        success: false,
        message: 'Owner access required',
      }, 403)
    }

    try {
      const updates = await c.req.json()
      const success = authService.updateSystemConfig(user.id, updates)

      if (success) {
        return c.json({
          success: true,
          message: 'Configuration updated successfully',
        })
      }
      else {
        return c.json({
          success: false,
          message: 'Failed to update configuration',
        }, 500)
      }
    }
    catch (error) {
      console.error('Update config error:', error)
      return c.json({
        success: false,
        message: 'Invalid request format',
      }, 400)
    }
  }
}

export const authHandler = new AuthHandler()
