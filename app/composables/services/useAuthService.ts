import type { LoginRequest, LoginResponse, RegisterRequest } from '~/utils/types/auth.types'
import type { User } from '~/utils/types/user.types'
import { useServiceApi } from '../useServiceApi'

interface MeResponse {
  data: User
}

export const useAuthService = () => {
  const api = useServiceApi('auth')

  return {
    /** Login with credentials, no auth required for this call */
    login: (payload: LoginRequest) =>
      api.post<LoginResponse, LoginRequest>('/login', {
        body: payload,
        skipAuth: true,
      }),

    register: (payload: RegisterRequest) => api.post<LoginResponse, RegisterRequest>('/register', {
        body: payload,
        skipAuth: true,
        }),

    /** Logout current session */
    logout: () => api.post<void, void>('/logout', {}),

    /** Refresh access token, no auth required for this call */
    refresh: (refreshToken: string) =>
      api.post<LoginResponse, { token: string }>('/refresh', {
        body: { token: refreshToken },
        skipAuth: true,
      }),

    /** Fetch current user profile */
    fetchMe: () => api.get<MeResponse>('/me'),

    /** Request a password reset code to be sent to the user's email */
    requestPasswordReset: (email: string) =>
      api.post<{ success: boolean }, { email: string }>('/forget-password', {
        body: { email },
        skipAuth: true,
      }),

    /** Verify the password reset code */
    verifyResetCode: (email: string, code: string) =>
      api.post<{ success: boolean }, { email: string; code: string }>('/verify-reset-code', {
        body: { email, code },
        skipAuth: true,
      }),

    /** Reset the user's password using a valid code */
    resetPassword: (payload: { email: string; code: string; password: string }) =>
      api.post<{ success: boolean }, { email: string; code: string; password: string }>('/reset-password', {
        body: payload,
        skipAuth: true,
      }),
  }
}
