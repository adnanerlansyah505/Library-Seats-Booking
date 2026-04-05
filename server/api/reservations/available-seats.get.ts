import type { H3Event } from 'h3'
import { createError, getQuery } from 'h3'
import { eq } from 'drizzle-orm'

import { db } from '../../db/client'
import { libraries } from '../../db/schemas/libraries'
import { librarySeats } from '../../db/schemas/seats'

interface SeatDto {
	id: string
	label: string
	time: string
	date: string | null
	isAvailable: boolean
}

interface AvailableSeatsResponse {
	data: SeatDto[]
}

const slugify = (value: string): string =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '')

export default defineEventHandler(async (event: H3Event): Promise<AvailableSeatsResponse> => {
	const query = getQuery(event) as { bookingSlug?: string; date?: string }
	const bookingSlug = query.bookingSlug
	const date = query.date ?? null

	if (!bookingSlug) {
		throw createError({
			statusCode: 400,
			statusMessage: 'bookingSlug is required',
		})
	}

	try {
		// Find the library by matching slugified name to the bookingSlug param
		const allLibraries = await db.select().from(libraries)
		const library = allLibraries.find(lib => lib.slug === bookingSlug)

		if (!library) {
			throw createError({
				statusCode: 404,
				statusMessage: 'Library not found',
			})
		}

		// Fetch all active seats for this library
		const seats = await db
			.select()
			.from(librarySeats)
			.where(eq(librarySeats.libraryId, library.id))

		const activeSeats = seats.filter(seat => seat.isActive)

		// TODO: incorporate reservations table to mark seats occupied for a given date/time.
		// For now, treat all active seats as available and use a placeholder time range.
		const data: SeatDto[] = activeSeats.map(seat => ({
			id: seat.code,
			label: seat.label || `Seat ${seat.code}`,
			time: '10:00 AM - 12:00 PM',
			date,
			isAvailable: true,
		}))

		return { data }
	}
	catch (error: any) {
		// eslint-disable-next-line no-console
		console.error('Available seats error:', error)

		if (error.statusCode) {
			throw error
		}

		throw createError({
			statusCode: 500,
			statusMessage: 'Unable to fetch available seats. Please try again later.',
		})
	}
})
