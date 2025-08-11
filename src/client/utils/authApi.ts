import { ofetch } from 'ofetch'
import { useAuthStore } from '../stores/authStore'

/**
 * Create an authenticated API client that automatically includes auth token
 */
export function createAuthApi() {
  const authStore = useAuthStore()

  return ofetch.create({
    onRequest({ options }) {
      // Add auth token to requests if available
      if (authStore.authToken) {
        options.headers.set('Authorization', `Bearer ${authStore.authToken}`)
      }
    },

    onResponseError({ response }) {
      // Handle auth errors
      if (response.status === 401) {
        console.warn('Authentication expired, logging out')
        authStore.logout()

        // Redirect to login or show login modal
        // This will be handled by the UI components
      }
    },
  })
}

/**
 * Convenient wrapper for authenticated API calls
 */
export const authApi = createAuthApi()
