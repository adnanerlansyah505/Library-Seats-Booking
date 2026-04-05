import type { H3Event } from 'h3'
import { createError, readBody } from 'h3'
import { eq } from 'drizzle-orm'

import { db } from '../../db/client'
import { users } from '../../db/schemas/users'

interface VerifyResetCodeRequest {
  email: string
  code: string
}

interface VerifyResetCodeResponse {
  success: boolean
}

export default defineEventHandler(async (event: H3Event): Promise<VerifyResetCodeResponse> => {
  try {
    const body = await readBody<VerifyResetCodeRequest>(event)
    const emailRaw = body?.email?.trim()
    const code = body?.code?.trim()

    if (!emailRaw || !code) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email and verification code are required',
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

    return { success: true }
  }
  catch (error: any) {
    if (error?.statusCode && error?.statusMessage) {
      throw error
    }

    // eslint-disable-next-line no-console
    console.error('Verify reset code error:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to verify code. Please try again later.',
    })
  }
})
