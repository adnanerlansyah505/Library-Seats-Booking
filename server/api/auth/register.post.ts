import type { H3Event } from 'h3'
import { createError, readBody } from 'h3'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

import type { RegisterRequest, LoginResponse } from '~/utils/types/auth.types'
import type { User } from '~/utils/types/user.types'
import { db } from '../../db/client'
import { users } from '../../db/schemas/users'
import { createTokensFromUser } from '../../utils/authTokens'
import { profiles } from '~~/server/db/schemas'

export default defineEventHandler(async (event: H3Event): Promise<LoginResponse> => {
  try {
    const body = await readBody<RegisterRequest>(event)

    if (!body?.email || !body?.password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email and password are required',
      })
    }

    if (!body.role || (body.role !== 'admin' && body.role !== 'student')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valid role is required',
      })
    }

    const email = body.email.toLowerCase()
    const username = email.split('@')[0] || '' // Simple username generation from email prefix
    const passwordHash = await bcrypt.hash(body.password, 10)
    const studentId = body.studentId || ''

    // Check if user already exists
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existing.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Email is already registered',
      })
    }

    const [created] = await db
      .insert(users)
      .values({
        email,
        username,
        studentId,
        password: passwordHash,
        role: body.role === 'admin' ? ('admin' as const) : ('student' as const),
      })
      .returning()

    if (!created) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create user',
      })
    }

    // Create the profile record with default values
    await db
      .insert(profiles)
      .values({
        userId: created.id,
        firstName: body.firstName?.trim() || '',
        lastName: body.lastName?.trim() || '',
      })

    const user = mapUser(created)
    const tokens = createTokensFromUser(user)

    return {
      data: {
        tokens,
      },
    }
  }
  catch (error: any) {
    if (error?.statusCode && error?.statusMessage) {
      throw error
    }

    // eslint-disable-next-line no-console
    console.error('Register error:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to register. Please try again later.',
    })
  }
})
