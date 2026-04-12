import type { H3Event } from 'h3'
import { createError, getHeader, readBody } from 'h3'
import { and, eq, inArray } from 'drizzle-orm'

import type { JwtPayload } from '~/utils/types/auth.types'
import { db } from '../../db/client'
import { libraries } from '../../db/schemas/libraries'
import { librarySeats } from '../../db/schemas/seats'
import { reservations } from '../../db/schemas/reservations'
import { verifyToken } from '../../utils/authTokens'

interface CreateReservationBody {
  bookingSlug?: string
  seatSlug?: string
  date?: string
}

interface ReservationDto {
  id: number
  libraryId: number
  seatId: number | null
  reservedDate: string | null
  startTime: string | null
  endTime: string | null
  status: string
}

export default defineEventHandler(async (event: H3Event): Promise<{ data: ReservationDto }> => {
  const authHeader = getHeader(event, 'authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const token = authHeader.slice('Bearer '.length).trim()
  const payload = verifyToken<JwtPayload>(token)

  const body = await readBody<CreateReservationBody>(event)
  const { bookingSlug, seatSlug } = body
  let { date } = body

  if (!bookingSlug || !seatSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'bookingSlug and seatSlug are required',
    })
  }

  // Default to today if date is not provided
  if (!date) {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    date = `${yyyy}-${mm}-${dd}`
  }

  let reservedDate: Date | null = null
  let reservedDateString: string | null = null
  if (date) {
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid date format' })
    }
    reservedDate = parsed
    const iso = parsed.toISOString()
    reservedDateString = iso.split('T')[0] ?? null
  }

  try {
    // Find library by slug
    const [library] = await db
      .select()
      .from(libraries)
      .where(eq(libraries.slug, bookingSlug))
      .limit(1)

    if (!library) {
      throw createError({ statusCode: 404, statusMessage: 'Library not found' })
    }

    // Find seat within the library by slug or code
    const seats = await db
      .select()
      .from(librarySeats)
      .where(eq(librarySeats.libraryId, library.id))

    const normalizedSeatSlug = seatSlug.toLowerCase()
    const seat = seats.find(s =>
      (s.slug && s.slug.toLowerCase() === normalizedSeatSlug) ||
      s.code.toLowerCase() === normalizedSeatSlug,
    )

    if (!seat) {
      throw createError({ statusCode: 404, statusMessage: 'Seat not found' })
    }

    if (!reservedDate || !reservedDateString) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid or missing reservation date' })
    }

    // Prevent double-booking: check if this seat is already reserved for the same date
    const [existingReservation] = await db
      .select()
      .from(reservations)
      .where(and(
        eq(reservations.seatId, seat.id),
        eq(reservations.libraryId, library.id),
  eq(reservations.reservedDate, reservedDateString),
        inArray(reservations.status, ['pending', 'confirmed']),
      ))
      .limit(1)

    if (existingReservation) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Seat is already booked for this date',
      })
    }

    // Derive reservation start and end times from the seat's open and close times (if available)
  let startTime: Date | null = null
  let endTime: Date | null = null

    if (seat.openTime) {
      const base = new Date(reservedDate)
      const [h, m, s] = seat.openTime.toString().split(':').map(part => Number.parseInt(part, 10))
      base.setHours(h || 0, m || 0, s || 0, 0)
      startTime = base
    }

    if (seat.closeTime) {
      const base = new Date(reservedDate)
      const [h, m, s] = seat.closeTime.toString().split(':').map(part => Number.parseInt(part, 10))
      base.setHours(h || 0, m || 0, s || 0, 0)
      endTime = base
    }

    const [created] = await db
      .insert(reservations)
      .values({
        userId: payload.id,
        libraryId: library.id,
        seatId: seat.id,
        reservedDate: reservedDateString,
        startTime,
        endTime,
      })
      .returning()

  if (!created) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create reservation' })
  }

  const dto: ReservationDto = {
    id: created.id,
    libraryId: created.libraryId,
    seatId: created.seatId ?? null,
    reservedDate: created.reservedDate ? created.reservedDate.toString() : null,
    startTime: created.startTime ? created.startTime.toString() : null,
    endTime: created.endTime ? created.endTime.toString() : null,
    status: created.status ?? 'pending',
  }

  return { data: dto }
  }
  catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Create reservation error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to create reservation. Please try again later.',
    })
  }
})
