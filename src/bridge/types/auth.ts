// Authentication and authorization types for MyOS applications

// Application definition in MyOS
export interface OSApp {
  id: string // Unique app identifier (e.g., 'chat', 'calendar', 'finder')
  name: string // Display name
  icon: string // Icon class name
  description?: string // App description
  version: string // App version
  category: 'system' | 'productivity' | 'entertainment' | 'utility'
  permissions: AppPermission[] // Available permissions for this app
}

// Permission definition for apps
export interface AppPermission {
  id: string // Permission identifier (e.g., 'chat.send', 'chat.history')
  name: string // Human readable name
  description: string // What this permission allows
  level: 'read' | 'write' | 'admin' // Permission level
  required: boolean // Whether this permission is required for basic app functionality
}

// User authentication token
export interface AuthToken {
  token: string
  userId: string
  expiresAt: Date
  createdAt: Date
  name: string // Token name for management
  permissions: UserPermission[]
}

// User's permission for a specific app
export interface UserPermission {
  userId: string
  appId: string
  permissionId: string
  grantedAt: Date
  grantedBy: string // Who granted this permission
  expiresAt?: Date // Optional expiration
}

// User profile with authentication
export interface AuthenticatedUser {
  id: string
  username: string
  displayName: string
  email?: string
  avatarUrl?: string
  role: 'owner' | 'user' | 'guest'
  createdAt: Date
  lastActiveAt: Date
  tokens: AuthToken[]
  permissions: UserPermission[]
}

// Login credentials
export interface LoginRequest {
  token?: string // Token-based login
  username?: string // Username/password login (for owner)
  password?: string
}

// API response for authentication
export interface AuthResponse {
  success: boolean
  user?: AuthenticatedUser
  token?: string
  message?: string
  permissions?: UserPermission[]
}

// Permission check request
export interface PermissionCheckRequest {
  userId: string
  appId: string
  permissionId: string
}

// MyOS system configuration
export interface OSConfig {
  apps: OSApp[]
  allowPublicAccess: boolean
  requireTokenForChat: boolean
  maxTokensPerUser: number
  defaultTokenExpiry: number // in days
}
