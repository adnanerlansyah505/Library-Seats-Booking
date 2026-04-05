import type { H3Event } from 'h3'
import { createError, getHeader, readBody } from 'h3'
import { eq } from 'drizzle-orm'

import type { JwtPayload } from '~/utils/types/auth.types'
import type { User } from '~/utils/types/user.types'
import { db } from '../../db/client'
import { users } from '../../db/schemas/users'
import { profiles } from '../../db/schemas/profiles'
import { verifyToken, mapUser } from '../../utils/authTokens'

interface UpdateProfileBody {
	firstName?: string
	lastName?: string
	email?: string
	phone?: string
	address?: string
}

interface UpdateProfileResponse {
	data: User
}

export default defineEventHandler(async (event: H3Event): Promise<UpdateProfileResponse> => {
	try {
		const authHeader = getHeader(event, 'authorization')

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
		}

		const token = authHeader.slice('Bearer '.length).trim()
		const payload = verifyToken<JwtPayload>(token)

		const body = await readBody<UpdateProfileBody>(event)

		if (!body) {
			throw createError({ statusCode: 400, statusMessage: 'Invalid request body' })
		}

		const updateUserData: Partial<typeof users.$inferInsert> = {}
		const updateProfileData: Partial<typeof profiles.$inferInsert> = {}

		if (typeof body.email === 'string' && body.email.trim()) {
			updateUserData.email = body.email.trim().toLowerCase()
		}

		if (typeof body.firstName === 'string') {
			updateProfileData.firstName = body.firstName.trim()
		}
		if (typeof body.lastName === 'string') {
			updateProfileData.lastName = body.lastName.trim()
		}
		if (typeof body.phone === 'string') {
			updateProfileData.phone = body.phone.trim()
		}
		if (typeof body.address === 'string') {
			updateProfileData.address = body.address.trim()
		}

		if (Object.keys(updateUserData).length === 0 && Object.keys(updateProfileData).length === 0) {
			throw createError({ statusCode: 400, statusMessage: 'No profile fields to update' })
		}

		if (Object.keys(updateUserData).length > 0) {
			await db
				.update(users)
				.set({ ...updateUserData, updatedAt: new Date() })
				.where(eq(users.id, payload.id))
		}

		if (Object.keys(updateProfileData).length > 0) {
			const [existingProfile] = await db
				.select()
				.from(profiles)
				.where(eq(profiles.userId, payload.id))
				.limit(1)

			if (existingProfile) {
				await db
					.update(profiles)
					.set({ ...updateProfileData, updatedAt: new Date() })
					.where(eq(profiles.userId, payload.id))
			}
			else {
				// For a new profile we require firstName/lastName; fall back to empty strings if missing
				await db.insert(profiles).values({
					userId: payload.id,
					firstName: updateProfileData.firstName ?? '',
					lastName: updateProfileData.lastName ?? '',
					phone: updateProfileData.phone,
					address: updateProfileData.address,
				})
			}
		}

		// Re-fetch joined user+profile, mirroring /api/auth/me
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

		if (result.profile) {
			user.firstName = result.profile.firstName ?? user.firstName
			user.lastName = result.profile.lastName ?? user.lastName
			user.phone = result.profile.phone ?? user.phone
			user.address = result.profile.address ?? user.address
		}

		return { data: user }
	}
	catch (error: any) {
		if (error?.statusCode && error?.statusMessage) {
			throw error
		}

		// eslint-disable-next-line no-console
		console.error('Update profile error:', error)

		throw createError({
			statusCode: 500,
			statusMessage: 'Unable to update profile. Please try again later.',
		})
	}
})
