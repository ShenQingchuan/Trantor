import type { AuthenticatedUser, AuthResponse, OSApp, UserPermission } from '../../bridge/types/auth.js'
import { useLocalStorage } from '@vueuse/core'
import { ofetch } from 'ofetch'

const authStoreId = 'trantor:auth-store' as const

export const useAuthStore = defineStore(authStoreId, () => {
  // Reactive state
  const authToken = useLocalStorage<string | null>('trantor:auth-token', null)
  const isAuthenticated = ref(!!authToken.value) // 基于token存在性初始化
  const currentUser = ref<AuthenticatedUser | null>(null)
  const availableApps = ref<OSApp[]>([])
  const userPermissions = ref<UserPermission[]>([])

  // Loading states
  const isLoading = ref(false)
  const isInitializing = ref(true)

  // API base URL
  const API_BASE = '/api/auth'

  /**
   * Logout and clear all auth data
   */
  const logout = () => {
    currentUser.value = null
    authToken.value = null
    userPermissions.value = []
    isAuthenticated.value = false
  }

  /**
   * Load available apps from server
   */
  const loadAvailableApps = async () => {
    try {
      const response = await ofetch<{ success: boolean, apps: OSApp[] }>(`${API_BASE}/apps`)

      if (response.success) {
        availableApps.value = response.apps
      }
    }
    catch (error) {
      console.error('Failed to load apps:', error)
    }
  }

  /**
   * Authenticate with existing token
   */
  const authenticateWithToken = async (token: string): Promise<boolean> => {
    try {
      const response = await ofetch<{ success: boolean, user: AuthenticatedUser }>(`${API_BASE}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.success && response.user) {
        currentUser.value = response.user
        authToken.value = token
        userPermissions.value = response.user.permissions || []
        isAuthenticated.value = true

        return true
      }
      else {
        throw new Error('Token validation failed')
      }
    }
    catch (error) {
      console.error('Token authentication failed:', error)
      logout()
      return false
    }
  }

  /**
   * Initialize auth store on app startup
   */
  const initialize = async () => {
    isInitializing.value = true

    try {
      // Load available apps
      await loadAvailableApps()

      // Try to authenticate with stored token
      if (authToken.value) {
        await authenticateWithToken(authToken.value)
      }
    }
    catch (error) {
      console.warn('Auth initialization failed:', error)
      // Clear invalid token
      logout()
    }
    finally {
      isInitializing.value = false
    }
  }

  /**
   * Login with username/password (owner only) or token
   */
  const login = async (credentials: { username?: string, password?: string, token?: string }): Promise<boolean> => {
    isLoading.value = true

    try {
      const response = await ofetch<AuthResponse>(`${API_BASE}/login`, {
        method: 'POST',
        body: credentials,
      })

      if (response.success && response.user && response.token) {
        // Update state
        currentUser.value = response.user
        authToken.value = response.token
        userPermissions.value = response.permissions || response.user.permissions || []
        isAuthenticated.value = true

        return true
      }
      else {
        throw new Error(response.message || 'Login failed')
      }
    }
    catch (error) {
      console.error('Login error:', error)
      logout()
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Check if user has specific permission
   */
  const hasPermission = (appId: string, permissionId: string): boolean => {
    if (!isAuthenticated.value || !currentUser.value) {
      return false
    }

    // Owner has all permissions
    if (currentUser.value.role === 'owner') {
      return true
    }

    // Check user permissions
    return userPermissions.value.some(p =>
      p.appId === appId
      && p.permissionId === permissionId
      && (!p.expiresAt || new Date(p.expiresAt) > new Date()),
    )
  }

  /**
   * Check if user can access a specific app
   */
  const canAccessApp = (appId: string): boolean => {
    const app = availableApps.value.find(a => a.id === appId)
    if (!app)
      return false

    // Check if user has any required permissions for this app
    const requiredPermissions = app.permissions.filter(p => p.required)

    if (requiredPermissions.length === 0) {
      return true // No required permissions
    }

    return requiredPermissions.every(permission =>
      hasPermission(appId, permission.id),
    )
  }

  /**
   * Get user's permissions for a specific app
   */
  const getAppPermissions = (appId: string): UserPermission[] => {
    return userPermissions.value.filter(p => p.appId === appId)
  }

  /**
   * Get accessible apps for current user
   */
  const getAccessibleApps = computed(() => {
    return availableApps.value.filter(app => canAccessApp(app.id))
  })

  /**
   * Refresh user permissions
   */
  const refreshPermissions = async () => {
    if (!authToken.value)
      return

    try {
      const response = await ofetch<{ success: boolean, user: AuthenticatedUser }>(`${API_BASE}/me`, {
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
      })

      if (response.success && response.user) {
        currentUser.value = response.user
        userPermissions.value = response.user.permissions || []
      }
    }
    catch (error) {
      console.error('Failed to refresh permissions:', error)
    }
  }

  // Computed properties
  const isOwner = computed(() => currentUser.value?.role === 'owner')
  const isGuest = computed(() => currentUser.value?.role === 'guest')

  // Watch authToken changes to sync isAuthenticated
  watch(authToken, (newToken) => {
    isAuthenticated.value = !!newToken
  })

  return {
    // State
    isAuthenticated: readonly(isAuthenticated),
    currentUser: readonly(currentUser),
    authToken: readonly(authToken),
    availableApps: readonly(availableApps),
    userPermissions: readonly(userPermissions),
    isLoading: readonly(isLoading),
    isInitializing: readonly(isInitializing),

    // Computed
    getAccessibleApps,
    isOwner,
    isGuest,

    // Actions
    initialize,
    login,
    logout,
    hasPermission,
    canAccessApp,
    getAppPermissions,
    refreshPermissions,
    loadAvailableApps,
  }
})
