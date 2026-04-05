
export type UserRole = 'admin' | 'student' | 'guest'

export interface User {
    id: number
    studentId?: string
    email: string
    firstName?: string
    lastName?: string
    role: UserRole
    isEmailVerified: boolean
    status?: boolean
    emailVerificationToken?: string
    emailVerificationExpires?: string
    phone?: string
    address?: string
    createdAt: string
    updatedAt: string
}