import type { H3Event } from 'h3'
import { createError, getHeader } from 'h3'
import { eq } from 'drizzle-orm'

import type { JwtPayload } from '~/utils/types/auth.types'
import type { User } from '~/utils/types/user.types'
import { db } from '../../db/client'
import { users } from '../../db/schemas/users'
import { verifyToken, mapUser } from '../../utils/authTokens'

interface MeResponse {
	data: User
}

export default defineEventHandler(async (event: H3Event): Promise<MeResponse> => {
	try {
		const authHeader = getHeader(event, 'authorization')

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
		}

		const token = authHeader.slice('Bearer '.length).trim()

		const payload = verifyToken<JwtPayload>(token)

		const [userRow] = await db
			.select()
			.from(users)
			.where(eq(users.id, payload.id))
			.limit(1)

		if (!userRow) {
			throw createError({ statusCode: 404, statusMessage: 'User not found' })
		}

		return {
			data: mapUser(userRow),
		}
	}
	catch (error: any) {
		if (error?.statusCode && error?.statusMessage) {
			throw error
		}

		// eslint-disable-next-line no-console
		console.error('Me error:', error)

		throw createError({
			statusCode: 500,
			statusMessage: 'Unable to fetch user profile. Please try again later.',
		})
	}
})

