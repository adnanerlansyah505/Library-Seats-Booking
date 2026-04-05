import type { H3Event } from 'h3'
import { createError, readBody } from 'h3'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

import { db } from '../../db/client'
import { users } from '../../db/schemas/users'

interface ResetPasswordRequest {
  email: string
  code: string
  password: string
}

interface ResetPasswordResponse {
  success: boolean
}

export default defineEventHandler(async (event: H3Event): Promise<ResetPasswordResponse> => {
  try {
    const body = await readBody<ResetPasswordRequest>(event)
    const emailRaw = body?.email?.trim()
    const code = body?.code?.trim()
    const password = body?.password?.trim()

    if (!emailRaw || !code || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email, verification code, and new password are required',
      })
    }

    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password must be at least 6 characters long',
      })
    }

    const email = emailRaw.toLowerCase()

    const [userRow] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!userRow || !userRow.emailVerificationToken || !userRow.emailVerificationExpires) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or expired verification code.',
      })
    }

    const now = new Date()

    if (
      userRow.emailVerificationToken !== code ||
      !userRow.emailVerificationExpires ||
      userRow.emailVerificationExpires < now
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or expired verification code.',
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await db
      .update(users)
      .set({
        password: passwordHash,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userRow.id))

    return { success: true }
  }
  catch (error: any) {
    if (error?.statusCode && error?.statusMessage) {
      throw error
    }

    // eslint-disable-next-line no-console
    console.error('Reset password error:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to reset password. Please try again later.',
    })
  }
})
