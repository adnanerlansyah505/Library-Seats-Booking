/**
 * Authentication Store (Pinia options API)
 *
 * state  : plain data (user, tokens)
 * getters: derived values (isAuthenticated, userRoles)
 * actions: login, logout, refreshTokens, fetchUser, checkAuth
 */

import { defineStore } from 'pinia'
import type { User, UserRole } from '~/utils/types/user.types'
import type { LoginRequest, LoginResponse, RegisterRequest } from '~/utils/types/auth.types'
import { useAuthService } from '../composables/services/useAuthService'

// Helper composables for SSR‑compatible cookie access
const getAccessTokenCookie = () =>
    useCookie<string | null>('accessToken', {
        maxAge: 15 * 60, // 15 minutes
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    })

const getRefreshTokenCookie = () =>
    useCookie<string | null>('refreshToken', {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    })

export const useAuthStore = defineStore('auth', {
    // ---------------------------------------------------------------------------
    // state
    // ---------------------------------------------------------------------------
    state: () => ({
        user: null as User | null,
        accessToken: null as string | null,
        refreshToken: null as string | null,
    }),

    // ---------------------------------------------------------------------------
    // getters
    // ---------------------------------------------------------------------------
    getters: {
        isAuthenticated: (state) => !!state.user && !!state.accessToken,

        userRoles: (state): UserRole[] => {
            return state.user?.role ? [state.user.role] : []
        },
    },

    // ---------------------------------------------------------------------------
    // actions
    // ---------------------------------------------------------------------------
    actions: {
        /** Sync in‑memory tokens from cookies (useful on first load) */
        syncTokensFromCookies() {
            const accessTokenCookie = getAccessTokenCookie()
            const refreshTokenCookie = getRefreshTokenCookie()

            this.accessToken = accessTokenCookie.value
            this.refreshToken = refreshTokenCookie.value
        },

        /** Helper to set tokens in both store state and cookies */
        setTokensFromResponse(tokens: LoginResponse['data']['tokens']) {
            const accessTokenCookie = getAccessTokenCookie()
            const refreshTokenCookie = getRefreshTokenCookie()

            accessTokenCookie.value = tokens.accessToken
            refreshTokenCookie.value = tokens.refreshToken

            this.accessToken = tokens.accessToken
            this.refreshToken = tokens.refreshToken
        },

        /** Helper to clear all auth‑related state and cookies */
        clearAuthState() {
            const accessTokenCookie = getAccessTokenCookie()
            const refreshTokenCookie = getRefreshTokenCookie()

            accessTokenCookie.value = null
            refreshTokenCookie.value = null

            this.accessToken = null
            this.refreshToken = null
            this.user = null
        },

        hasRole(role: string | string[]): boolean {
            const roles = Array.isArray(role) ? role : [role]
            return roles.some(r => this.userRoles.includes(r as UserRole))
        },

        async login(credentials: LoginRequest) {
            const authApi = useAuthService()

            try {
                const response = await authApi.login(credentials)

                this.setTokensFromResponse(response.data.tokens)
                await this.fetchUser()

                return response
            }
            catch (error) {
                console.error('Login failed:', error)
                throw error
            }
        },

        async register(payload: RegisterRequest) {
            const authApi = useAuthService()

            try {
                const response = await authApi.register(payload)

                return response
            }
            catch (error) {
                console.error('Registration failed:', error)
                throw error
            }
        },

        /** Update current user's profile (name, email, phone, address) */
        async updateProfile(payload: {
            firstName: string
            lastName: string
            email: string
            phone?: string
            address?: string
            studentId?: string
        }) {
            const { $api } = useNuxtApp()

            try {
                const response = await $api<{ data: User }>('/api/profile', {
                    method: 'PUT',
                    body: payload,
                })

                // Persist updated user in the auth store
                this.user = response.data
                return response.data
            }
            catch (error) {
                console.error('Update profile failed:', error)
                throw error
            }
        },

        async requestPasswordReset(email: string) {
            const authApi = useAuthService()

            try {
                const response = await authApi.requestPasswordReset(email)
                return response
            }
            catch (error) {
                console.error('Request password reset failed:', error)
                throw error
            }
        },

        async verifyResetCode(email: string, code: string) {
            const authApi = useAuthService()

            try {
                const response = await authApi.verifyResetCode(email, code)
                return response
            }
            catch (error) {
                console.error('Verify reset code failed:', error)
                throw error
            }
        },

        async resetPassword(payload: { email: string; code: string; password: string }) {
            const authApi = useAuthService()

            try {
                const response = await authApi.resetPassword(payload)
                return response
            }
            catch (error) {
                console.error('Reset password failed:', error)
                throw error
            }
        },

        async logout() {
            const authApi = useAuthService()

            try {
                await authApi.logout()
            }
            catch (error) {
                console.error('Logout API call failed:', error)
            }
            finally {
                this.clearAuthState()
                await navigateTo('/')
            }
        },

        async refreshTokens() {
            const authApi = useAuthService()

            if (!this.refreshToken) {
                throw new Error('No refresh token available')
            }

            try {
                const response = await authApi.refresh(this.refreshToken)

                this.setTokensFromResponse(response.data.tokens)

                return response
            }
            catch (error) {
                console.error('Token refresh failed:', error)
                this.clearAuthState()
                throw error
            }
        },

        async fetchUser() {
            const authApi = useAuthService()

            try {
                const userData = await authApi.fetchMe()
                this.user = userData.data
                return userData
            }
            catch (error) {
                this.user = null
                throw error
            }
        },

        async checkAuth(): Promise<boolean> {
            // Ensure we start from cookie state
            this.syncTokensFromCookies()

            if (this.user && this.accessToken) {
                return true
            }

            if (!this.accessToken && !this.refreshToken) {
                return false
            }

            if (!this.accessToken && this.refreshToken) {
                try {
                    await this.refreshTokens()
                }
                catch (error) {
                    this.clearAuthState()
                    return false
                }
            }

            try {
                await this.fetchUser()
                return true
            }
            catch (error: any) {
                if (error.statusCode === 401) {
                    this.clearAuthState()
                }
                return false
            }
        },
    },
})