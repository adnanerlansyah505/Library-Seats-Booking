import type { UserRole } from "./user.types"

export interface AuthTokens {
    accessToken: string
    refreshToken: string
}

export interface LoginRequest {
    email: string
    password: string
}

export interface LoginResponse {
    data: {
        tokens: AuthTokens
    }
}

export interface RefreshRequest {
    token: string
}

export interface RefreshResponse {
    data: {
        tokens: AuthTokens
    }
}

export interface VerifyCodeEmailRequest {
    code: string
}

export interface VerifyEmailRequest {
    email: string
}

export interface RegisterRequest {
    studentId: string
    username: string
    email: string
    password: string
    firstName: string
    lastName: string
    role: UserRole
    phone: string
    studentId: string
}

export interface GoogleAuthRequest {
    access_token: string
    authuser: string
    expires_in: number
    scope: string
    token_type: string
}

export interface GoogleOneTapRequest {
    credential: string
    select_by: string
}

export interface CreateGoogleUserRequest {
    role: string
    tariff: number
    googleData: GoogleAuthRequest
}

export interface JwtPayload {
    id: number
    email: string
    role: UserRole
    iat: number
    exp: number
}