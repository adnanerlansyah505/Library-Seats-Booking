import type { H3Event } from 'h3'
import { createError, getQuery } from 'h3'
import { and, eq, inArray } from 'drizzle-orm'

import { db } from '../../db/client'
import { libraries } from '../../db/schemas/libraries'
import { librarySeats } from '../../db/schemas/seats'
import { reservations } from '../../db/schemas/reservations'

interface SeatDto {
	id: string
	label: string
	time: string
	date: string | null
	isAvailable: boolean
	type: string
}

interface AvailableSeatsResponse {
	data: SeatDto[]
	meta: {
		page: number
		pageSize: number
		total: number
		totalPages: number
	}
}

const PAGE_SIZE = 10

const formatTime = (value: string | null | undefined): string => {
	if (!value) return ''

	// Expecting format like "HH:MM" or "HH:MM:SS"
	const [hourStr, minuteStr] = value.split(':')
	const hour = Number.parseInt(hourStr ?? '0', 10)
	const minute = Number.parseInt(minuteStr ?? '0', 10)

	if (Number.isNaN(hour) || Number.isNaN(minute)) return value

	const suffix = hour >= 12 ? 'PM' : 'AM'
	const hour12 = ((hour + 11) % 12) + 1
	const minutePadded = String(minute).padStart(2, '0')

	return `${hour12}:${minutePadded} ${suffix}`
}

export default defineEventHandler(async (event: H3Event): Promise<AvailableSeatsResponse> => {
	const query = getQuery(event) as { bookingSlug?: string; date?: string; page?: string | number }
	const bookingSlug = query.bookingSlug
	const dateParam = query.date ?? null
	const pageRaw = query.page ?? 1
	let page = Number(pageRaw)
	if (!Number.isFinite(page) || page < 1) page = 1

	if (!bookingSlug) {
		throw createError({
			statusCode: 400,
			statusMessage: 'bookingSlug is required',
		})
	}

	try {
		// Compute "today" once for the whole handler
		const today = new Date()
		const yyyy = today.getFullYear()
		const mm = String(today.getMonth() + 1).padStart(2, '0')
		const dd = String(today.getDate()).padStart(2, '0')
		const todayStr = `${yyyy}-${mm}-${dd}`

		// Effective date used for availability checks. If the client doesn't
		// specify a date, we treat it as "today" so that results reflect
		// real-time availability.
		const effectiveDate = dateParam ?? todayStr

		// Find the library by slug
		const allLibraries = await db.select().from(libraries)
		const library = allLibraries.find(lib => lib.slug === bookingSlug)

		if (!library) {
			throw createError({
				statusCode: 404,
				statusMessage: 'Library not found',
			})
		}

		// If the client requested a specific date in the past, there should
		// be no available seats.
		if (dateParam && dateParam < todayStr) {
			return {
				data: [],
				meta: {
					page,
					pageSize: PAGE_SIZE,
					total: 0,
					totalPages: 0,
				},
			}
		}

		// Fetch all active seats for this library (we'll filter + paginate in memory)
		const allSeats = await db
			.select()
			.from(librarySeats)
			.where(
				and(
					eq(librarySeats.libraryId, library.id),
					eq(librarySeats.isActive, true),
				),
			)

		// Find seats that are already reserved for the effective date
		const reservationsForDate = await db
			.select({ seatId: reservations.seatId })
			.from(reservations)
			.where(
				and(
					eq(reservations.libraryId, library.id),
					eq(reservations.reservedDate, effectiveDate as any),
					inArray(reservations.status, ['pending', 'confirmed']),
				),
			)

		const reservedSeatIds = new Set<number>(
			reservationsForDate
				.map(r => r.seatId)
				.filter((id): id is number => id != null),
		)

		// Start from all active seats that have a valid time window.
		// We no longer hide seats based on the *current* time of day so that
		// users can book seats well in advance (e.g. later today or future dates).
		let seatsForResponse = allSeats.filter(seat => seat.openTime && seat.closeTime)

		// For the effective date, completely exclude seats that are already reserved
		// so that only truly available seats are returned.
		seatsForResponse = seatsForResponse.filter(seat => !reservedSeatIds.has(seat.id))

		const total = seatsForResponse.length
		const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 0
		const start = (page - 1) * PAGE_SIZE
		const pagedSeats = seatsForResponse.slice(start, start + PAGE_SIZE)

		const data: SeatDto[] = pagedSeats.map(seat => {
			const open = seat.openTime ? seat.openTime.toString() : null
			const close = seat.closeTime ? seat.closeTime.toString() : null
			const timeRange = open && close
				? `${formatTime(open)} - ${formatTime(close)}`
				: ''

			return {
				id: seat.code,
				label: seat.label || `Seat ${seat.code}`,
				time: timeRange,
				date: dateParam ?? null,
				// Seats returned here are, by definition, available for the
				// effective date and current time window.
				isAvailable: !reservedSeatIds.has(seat.id),
				type: seat.type ?? 'individual',
			}
		})

		return {
			data,
			meta: {
				page,
				pageSize: PAGE_SIZE,
				total,
				totalPages,
			},
		}
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
