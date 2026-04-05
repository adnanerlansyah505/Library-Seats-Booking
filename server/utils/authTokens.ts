import jwt from 'jsonwebtoken'
import { createError } from 'h3'

import type { AuthTokens, JwtPayload } from '~/utils/types/auth.types'
import type { User } from '~/utils/types/user.types'
import { users } from '../db/schemas'

const JWT_SECRET = process.env.JWT_SECRET as string | undefined
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

// Ensure we always have a valid JWT secret at runtime and for typing
function getJwtSecret(): string {
  if (!JWT_SECRET) {
    // eslint-disable-next-line no-console
    console.error('JWT_SECRET is not set in environment variables')

    throw createError({
      statusCode: 500,
      statusMessage: 'JWT secret is not configured',
    })
  }

  return JWT_SECRET
}

export function mapUser(row: typeof users.$inferSelect): User {
    return {
        id: row.id,
        studentId: row.studentId ?? undefined,
        email: row.email,
        role: row.role as User['role'],
        phone: undefined,
        isEmailVerified: row.isEmailVerified ?? false,
        status: row.status ?? true,
        emailVerificationToken: row.emailVerificationToken ?? undefined,
        emailVerificationExpires: row.emailVerificationExpires
            ? row.emailVerificationExpires.toISOString()
            : undefined,
        createdAt: row.createdAt?.toISOString?.() ?? new Date().toISOString(),
        updatedAt: row.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    }
}

/**
 * Create access & refresh tokens for a given user.
 * Shared between auth endpoints to avoid duplicated JWT logic.
 */
export function createTokensFromUser(user: User): AuthTokens {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  }

  const secret = getJwtSecret()

  // jsonwebtoken v9 typings are strict; cast through any to avoid noisy overload issues
  const accessToken = (jwt as any).sign(payload, secret, { expiresIn: JWT_EXPIRES_IN }) as string
  const refreshToken = (jwt as any).sign(payload, secret, { expiresIn: JWT_REFRESH_EXPIRES_IN }) as string

  return { accessToken, refreshToken }
}

/**
 * Verify a JWT (access or refresh) and return its payload.
 */
export function verifyToken<T extends object = JwtPayload>(token: string): T {
  const secret = getJwtSecret()

  try {
    return jwt.verify(token, secret) as T
  }
  catch (_err) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token',
    })
  }
}

