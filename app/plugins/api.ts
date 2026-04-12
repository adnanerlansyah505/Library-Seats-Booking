import { ofetch } from 'ofetch'
import { useAuthStore } from '../stores/auth.store'

declare module '#app' {
 interface NuxtApp {
  $api: typeof ofetch
 }
}

declare module '@vue/runtime-core' {
 interface ComponentCustomProperties {
  $api: typeof ofetch
 }
}

declare global {
 var $api: typeof ofetch
}

export default defineNuxtPlugin((nuxtApp) => {
 const i18nRedirected = useCookie<string>('i18n_redirected')
 const {
  public: { BaseURL },
 } = useRuntimeConfig()

 // Single active refresh promise to avoid race conditions
 let refreshPromise: Promise<void> | null = null
 const $api = ofetch.create({
  baseURL: BaseURL as string,

  async onRequest({ options }) {
   const authStore = useAuthStore()
   const currentLang = i18nRedirected.value || 'uk'

   // Add Authorization header if we have access token
    const headers: Record<string, string> = {
    'Accept-Language': currentLang,
   }

    // Allow some calls to explicitly skip auth (e.g. login, refresh)
    const skipAuth = (options as any)._skipAuth

   if (authStore.accessToken) {
     if (!skipAuth) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`
     }
   }

   options.headers = {
    ...options.headers,
    ...headers,
   } as any
  },

    async onResponseError({ request, options, response }): Promise<any> {
     // Handle 401 Unauthorized - token expired
     const isRetry = (options as any)._isRetry
     const skipAuth = (options as any)._skipAuth

     if (response.status === 401 && !isRetry && !skipAuth) {
    const authStore = useAuthStore()

  try {
   // Avoid multiple simultaneous refresh calls
   if (!refreshPromise) {
    refreshPromise = (async () => {
     await authStore.refreshTokens()
    })().finally(() => {
     refreshPromise = null
    })
   }

  // Wait for token refresh
   await refreshPromise

   // Retry the original request with new token
   return await ofetch(request, { ...options, _isRetry: true } as any)
  }
  catch (e) {
   // Refresh failed (e.g. no refresh token). Clear auth but do not
   // force navigation; let the caller handle the 401 (e.g. show an
   // inline alert or redirect to login).
   authStore.clearAuthState()

   throw createError({
    statusCode: 401,
    statusMessage: 'You must login first to perform this action.',
   })
  }
   }

  // Other errors - throw unified, human-friendly error
  const statusCode = response.status
  const backendMessage = response._data?.message as string | undefined

  // For server-side (5xx) errors, never surface internal messages to the client
  if (statusCode >= 500) {
   throw createError({
    statusCode,
    statusMessage: 'Something went wrong. Please try again later.',
   })
  }

  // For 4xx errors, use backend message if present, otherwise a generic one
  throw createError({
   statusCode,
   statusMessage: backendMessage || 'Request failed. Please check your input and try again.',
  })
  },
 })

 // Make available globally
 globalThis.$api = $api

 return {
  provide: {
   api: $api,
  },
 }
})