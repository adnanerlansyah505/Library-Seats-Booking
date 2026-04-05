import type { H3Event } from 'h3'
import { createError, readBody } from 'h3'
import { eq } from 'drizzle-orm'

import type { RefreshRequest, RefreshResponse, JwtPayload } from '~/utils/types/auth.types'
import type { User } from '~/utils/types/user.types'
import { db } from '../../db/client'
import { users } from '../../db/schemas/users'
import { verifyToken, createTokensFromUser, mapUser } from '../../utils/authTokens'

export default defineEventHandler(async (event: H3Event): Promise<RefreshResponse> => {
	try {
		const body = await readBody<RefreshRequest>(event)

		if (!body?.token) {
			throw createError({
				statusCode: 400,
				statusMessage: 'Refresh token is required',
			})
		}

		let payload: JwtPayload

		try {
			payload = verifyToken<JwtPayload>(body.token)
		}
		catch (_err) {
			throw createError({
				statusCode: 401,
				statusMessage: 'Invalid or expired refresh token',
			})
		}

		const [userRow] = await db
			.select()
			.from(users)
			.where(eq(users.id, payload.id))
			.limit(1)

		if (!userRow) {
			throw createError({
				statusCode: 404,
				statusMessage: 'User not found',
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
		if (error?.statusCode && error?.statusMessage) {
			throw error
		}

		// eslint-disable-next-line no-console
		console.error('Refresh error:', error)

		throw createError({
			statusCode: 500,
			statusMessage: 'Unable to refresh session. Please login again.',
		})
	}
})

