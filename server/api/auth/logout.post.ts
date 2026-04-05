import type { H3Event } from 'h3'
import { createError } from 'h3'

interface LogoutResponse {
	success: boolean
}

// Stateless logout: client just clears its own tokens. This endpoint exists for
// symmetry and potential future server-side revocation, but currently always
// returns success as long as it is reachable.
export default defineEventHandler(async (_event: H3Event): Promise<LogoutResponse> => {
	try {
		return { success: true }
	}
	catch (error: any) {
		// eslint-disable-next-line no-console
		console.error('Logout error:', error)

		throw createError({
			statusCode: 500,
			statusMessage: 'Unable to logout. Please try again later.',
		})
	}
})

