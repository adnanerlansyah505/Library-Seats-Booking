/**
 * Role-based Authorization Middleware
 * Checks if user has required role(s)
 * SSR-compatible
 *
 * Usage in page:
 * definePageMeta({
 *   middleware: ['auth', 'role'],
 *   roles: ['ADMIN'] // or ['ADMIN', 'OWNER'] for multiple roles
 * })
 */

import { useAuthStore } from "~/stores/auth.store"

export default defineNuxtRouteMiddleware(async (to, from) => {
    const authStore = useAuthStore()

    // Ensure user is authenticated first
    await authStore.checkAuth()

    if (!authStore.user) {
        return navigateTo({
            path: '/',
            query: { redirect: to.fullPath },
        })
    }

    // Get required roles from route meta
    const requiredRoles = to.meta.roles as string[] | string | undefined

    if (!requiredRoles) {
        console.warn('Role middleware used but no roles defined in route meta')
        return
    }

    // Check if user has required role
    if (!authStore.hasRole(requiredRoles)) {
        // Redirect to error page
        return navigateTo({
            path: '/error',
            query: {
                code: '403',
                message: 'You do not have permission to access this page',
            },
        })
    }
})