/**
 * Guest Middleware
 * Prevents authenticated users from accessing guest-only pages (e.g., login, register)
 * Redirects authenticated users to dashboard
 */

import { useAuthStore } from "~/stores/auth.store"

export default defineNuxtRouteMiddleware(async (to, from) => {
    const authStore = useAuthStore()

    // Check if user is authenticated
    // If user data is already loaded and we have tokens, user is authenticated
    if (authStore.isAuthenticated) {
        // Prevent authenticated users from accessing guest pages
        return navigateTo('/dashboard')
    }

    // If we have tokens but no user data yet, wait for auth check
    if ((authStore.accessToken || authStore.refreshToken) && !authStore.user) {
        try {
            await authStore.checkAuth()

            // After checking, if authenticated, redirect
            if (authStore.isAuthenticated) {
                return navigateTo('/dashboard')
            }
        }
        catch {
            // Auth check failed, allow access to guest page
        }
    }

    // User is not authenticated, allow access
})