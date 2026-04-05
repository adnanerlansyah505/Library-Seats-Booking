
export type UserRole = 'admin' | 'student' | 'guest'

export interface User {
    id: number
    email: string
    firstName?: string
    lastName?: string
    role: UserRole
    phone?: string
    isEmailVerified: boolean
    status?: boolean
    emailVerificationToken?: string
    emailVerificationExpires?: string
    createdAt: string
    updatedAt: string
}