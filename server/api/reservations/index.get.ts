import type { H3Event } from 'h3'
import { createError, getHeader } from 'h3'
import { and, desc, eq } from 'drizzle-orm'

import type { JwtPayload } from '~/utils/types/auth.types'
import { db } from '../../db/client'
import { libraries } from '../../db/schemas/libraries'
import { librarySeats } from '../../db/schemas/seats'
import { reservations } from '../../db/schemas/reservations'
import { verifyToken } from '../../utils/authTokens'

interface ReservationListItemDto {
  id: number
  libraryName: string
  libraryLocation: string | null
  seatCode: string | null
  seatLabel: string | null
  floor: number | null
  area: string | null
  reservedDate: string | null
  startTime: string | null
  endTime: string | null
  status: string
}

interface ReservationListResponse {
  data: ReservationListItemDto[]
}

export default defineEventHandler(async (event: H3Event): Promise<ReservationListResponse> => {
  const authHeader = getHeader(event, 'authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const token = authHeader.slice('Bearer '.length).trim()
  const payload = verifyToken<JwtPayload>(token)

  try {
    const rows = await db
      .select({
        id: reservations.id,
        libraryName: libraries.name,
        libraryLocation: libraries.location,
        seatCode: librarySeats.code,
        seatLabel: librarySeats.label,
        floor: librarySeats.floor,
        area: librarySeats.area,
        reservedDate: reservations.reservedDate,
        startTime: reservations.startTime,
        endTime: reservations.endTime,
        status: reservations.status,
      })
      .from(reservations)
      .leftJoin(libraries, eq(reservations.libraryId, libraries.id))
      .leftJoin(librarySeats, eq(reservations.seatId, librarySeats.id))
      .where(eq(reservations.userId, payload.id))
      .orderBy(desc(reservations.reservedDate), desc(reservations.startTime))

    const data: ReservationListItemDto[] = rows.map(row => ({
      id: row.id,
      libraryName: row.libraryName ?? 'Unknown library',
      libraryLocation: row.libraryLocation ?? null,
      seatCode: row.seatCode ?? null,
      seatLabel: row.seatLabel ?? null,
      floor: row.floor ?? null,
      area: row.area ?? null,
      reservedDate: row.reservedDate ? row.reservedDate.toString() : null,
      startTime: row.startTime ? row.startTime.toString() : null,
      endTime: row.endTime ? row.endTime.toString() : null,
      status: row.status ?? 'pending',
    }))

    return { data }
  }
  catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('List reservations error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to fetch reservations. Please try again later.',
    })
  }
})
