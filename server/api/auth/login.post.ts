import type { H3Event } from 'h3'
import { createError, readBody } from 'h3'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

import type { LoginRequest, LoginResponse } from '~/utils/types/auth.types'
import type { User } from '~/utils/types/user.types'
import { db } from '../../db/client'
import { users } from '../../db/schemas/users'
import { createTokensFromUser } from '../../utils/authTokens'

function mapUser(row: typeof users.$inferSelect): User {
	return {
		id: row.id,
		email: row.email,
		firstName: undefined,
		lastName: undefined,
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

export default defineEventHandler(async (event: H3Event): Promise<LoginResponse> => {
	try {
		const body = await readBody<LoginRequest>(event)

		if (!body?.email || !body?.password) {
			throw createError({
				statusCode: 400,
				statusMessage: 'Email and password are required',
			})
		}

		const [userRow] = await db
			.select()
			.from(users)
			.where(eq(users.email, body.email.toLowerCase()))
			.limit(1)

		if (!userRow) {
			throw createError({
				statusCode: 401,
				statusMessage: 'Invalid email or password',
			})
		}

		const isValid = await bcrypt.compare(body.password, userRow.password)

		if (!isValid) {
			throw createError({
				statusCode: 401,
				statusMessage: 'Invalid email or password',
			})
		}

		const user = mapUser(userRow)
		const tokens = createTokensFromUser(user)

		return {
			data: {
				tokens,
			},
		}
	}
	catch (error: any) {
		// Re-throw known HTTP errors as-is
		if (error?.statusCode && error?.statusMessage) {
			throw error
		}

		// Log technical details on the server only
		// eslint-disable-next-line no-console
		console.error('Login error:', error)

		// Return a generic, human-readable error to the client
		throw createError({
			statusCode: 500,
			statusMessage: 'Unable to login. Please try again later.',
		})
	}
})

