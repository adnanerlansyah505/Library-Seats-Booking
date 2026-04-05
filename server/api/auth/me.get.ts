import type { H3Event } from 'h3'
import { createError, getHeader } from 'h3'
import { eq } from 'drizzle-orm'

import type { JwtPayload } from '~/utils/types/auth.types'
import type { User } from '~/utils/types/user.types'
import { db } from '../../db/client'
import { users } from '../../db/schemas/users'
import { profiles } from '../../db/schemas/profiles'
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

		const [result] = await db
			.select({ user: users, profile: profiles })
			.from(users)
			.leftJoin(profiles, eq(profiles.userId, users.id))
			.where(eq(users.id, payload.id))
			.limit(1)

		if (!result?.user) {
			throw createError({ statusCode: 404, statusMessage: 'User not found' })
		}

		const user: User = mapUser(result.user)

		// Override name/phone/address fields with data from profiles table if available
		if (result.profile) {
			user.studentId = result.user.studentId
			user.firstName = result.profile.firstName ?? user.firstName
			user.lastName = result.profile.lastName ?? user.lastName
			user.phone = result.profile.phone ?? user.phone
			user.address = result.profile.address ?? user.address
		}

		return {
			data: user,
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

