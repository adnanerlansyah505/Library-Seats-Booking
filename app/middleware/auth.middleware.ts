// middleware/auth.ts
/**
 * Authentication Middleware
 * Protects routes requiring authentication
 * SSR-compatible - uses Pinia store to check auth status
 */

import { useAuthStore } from "~/stores/auth.store"

export default defineNuxtRouteMiddleware(async (to, from) => {
    const authStore = useAuthStore()
    // Check if user is authenticated
    // This will try to fetch user data if not already loaded
    const isAuth = await authStore.checkAuth()

    // Not authenticated - redirect to login
    if (!isAuth) {
        return navigateTo({
            path: '/',
            query: { redirect: to.fullPath },
        })
    }
})