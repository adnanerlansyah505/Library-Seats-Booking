import type { H3Event } from 'h3'
import { createError, readBody } from 'h3'
import { eq } from 'drizzle-orm'

import type { VerifyEmailRequest } from '~/utils/types/auth.types'
import { db } from '../../db/client'
import { users } from '../../db/schemas/users'
import { sendPasswordResetCode } from '../../lib/mailer'

interface ForgetPasswordResponse {
	success: boolean
}

export default defineEventHandler(async (event: H3Event): Promise<ForgetPasswordResponse> => {
	try {
		const body = await readBody<VerifyEmailRequest>(event)
		const emailRaw = body?.email?.trim()

		if (!emailRaw) {
			throw createError({
				statusCode: 400,
				statusMessage: 'Email is required',
			})
		}

		const email = emailRaw.toLowerCase()

		const [userRow] = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1)

		if (!userRow) {
			// To avoid leaking which emails exist, return success even if user is not found
			return { success: true }
		}

		// Generate a 6-digit numeric code
		const code = String(Math.floor(100000 + Math.random() * 900000))
		const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

		await db
			.update(users)
			.set({
				emailVerificationToken: code,
				emailVerificationExpires: expiresAt,
			})
			.where(eq(users.id, userRow.id))

		// Fire-and-forget email sending; errors are logged but do not fail the request
		await sendPasswordResetCode(email, code)

		return { success: true }
	}
	catch (error: any) {
		if (error?.statusCode && error?.statusMessage) {
			throw error
		}

		// eslint-disable-next-line no-console
		console.error('Forget password error:', error)

		throw createError({
			statusCode: 500,
			statusMessage: 'Unable to process password reset. Please try again later.',
		})
	}
})

