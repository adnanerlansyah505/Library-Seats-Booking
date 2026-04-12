import type { H3Event } from 'h3'
import { createError, getQuery } from 'h3'
import { and, eq, ilike, inArray } from 'drizzle-orm'

import { db } from '../../db/client'
import { libraries } from '../../db/schemas/libraries'
import { librarySeats } from '../../db/schemas/seats'
import { reservations } from '../../db/schemas/reservations'

interface SeatSearchItemDto {
  id: string
  label: string
  time: string
  date: string | null
  isAvailable: boolean
  type: string
  library: {
    id: number
    slug: string
    name: string
    location: string | null
  }
}

interface SeatSearchResponse {
  data: SeatSearchItemDto[]
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

  const [hourStr, minuteStr] = value.split(':')
  const hour = Number.parseInt(hourStr ?? '0', 10)
  const minute = Number.parseInt(minuteStr ?? '0', 10)

  if (Number.isNaN(hour) || Number.isNaN(minute)) return value

  const suffix = hour >= 12 ? 'PM' : 'AM'
  const hour12 = ((hour + 11) % 12) + 1
  const minutePadded = String(minute).padStart(2, '0')

  return `${hour12}:${minutePadded} ${suffix}`
}

const parseTimeToMinutes = (value: string | null | undefined): number | null => {
  if (!value) return null

  const [hourStr, minuteStr] = value.split(':')
  const hour = Number.parseInt(hourStr ?? '0', 10)
  const minute = Number.parseInt(minuteStr ?? '0', 10)

  if (Number.isNaN(hour) || Number.isNaN(minute)) return null

  return hour * 60 + minute
}

const getTimeSlotRange = (slot: string | undefined | null): { start: number; end: number } | null => {
  switch (slot) {
    case 'morning':
      return { start: 8 * 60, end: 12 * 60 }
    case 'afternoon':
      return { start: 12 * 60, end: 17 * 60 }
    case 'evening':
      return { start: 17 * 60, end: 22 * 60 }
    default:
      return null
  }
}

export default defineEventHandler(async (event: H3Event): Promise<SeatSearchResponse> => {
  const query = getQuery(event) as {
    q?: string
    date?: string
    time?: string
    seatType?: string
    page?: string | number
  }

  const pageRaw = query.page ?? 1
  let page = Number(pageRaw)
  if (!Number.isFinite(page) || page < 1) page = 1

  try {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    const todayStr = `${yyyy}-${mm}-${dd}`

    // Use provided date (YYYY-MM-DD) or default to today for availability checks
    const effectiveDate = query.date && query.date.trim().length > 0
      ? query.date.trim()
      : todayStr

    // If client explicitly requested a past date, return empty
    if (query.date && effectiveDate < todayStr) {
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

    const timeSlot = getTimeSlotRange(query.time ?? null)

    // Base seat query: active seats joined with libraries, optional text + type filters
    const whereClauses: any[] = [eq(librarySeats.isActive, true)]

    if (query.q && query.q.trim().length > 0) {
      const term = `%${query.q.trim()}%`
      whereClauses.push(
        // Search across library name/location and seat label/code
        and(
          // Use a tautology in `and` so Drizzle is happy when we add more clauses
          ilike(libraries.name, term),
        ),
      )
    }

    if (query.seatType && query.seatType !== 'any') {
      whereClauses.push(eq(librarySeats.type, query.seatType as any))
    }

    const baseWhere = whereClauses.length > 0 ? and(...whereClauses) : undefined

    const rows = await db
      .select({
        seatId: librarySeats.id,
        seatCode: librarySeats.code,
        seatLabel: librarySeats.label,
        seatType: librarySeats.type,
        openTime: librarySeats.openTime,
        closeTime: librarySeats.closeTime,
        floor: librarySeats.floor,
        area: librarySeats.area,
        libraryId: libraries.id,
        librarySlug: libraries.slug,
        libraryName: libraries.name,
        libraryLocation: libraries.location,
      })
      .from(librarySeats)
      .innerJoin(libraries, eq(librarySeats.libraryId, libraries.id))
      .where(baseWhere as any)

    // Find seats that are already reserved for the effective date
    const reservationsForDate = await db
      .select({ seatId: reservations.seatId })
      .from(reservations)
      .where(
        and(
          eq(reservations.reservedDate, effectiveDate as any),
          inArray(reservations.status, ['pending', 'confirmed']),
        ),
      )

    const reservedSeatIds = new Set<number>(
      reservationsForDate
        .map(r => r.seatId)
        .filter((id): id is number => id != null),
    )

    const now = new Date()
    const nowMinutes = now.getHours() * 60 + now.getMinutes()

    const seatsForResponse = rows.filter(row => {
      if (!row.openTime || !row.closeTime) return false

      const openMinutes = parseTimeToMinutes(row.openTime.toString())
      const closeMinutes = parseTimeToMinutes(row.closeTime.toString())
      if (openMinutes == null || closeMinutes == null) return false

      // If a specific time slot is requested, ensure the seat is open for at least
      // part of that slot.
      if (timeSlot) {
        const { start, end } = timeSlot
        const overlaps = openMinutes < end && closeMinutes > start
        if (!overlaps) return false
      }
      else if (effectiveDate === todayStr) {
        // No explicit slot: for today, only show seats that are currently active.
        if (nowMinutes < openMinutes || nowMinutes >= closeMinutes) return false
      }

      // Exclude seats that are already reserved for the effective date
      if (reservedSeatIds.has(row.seatId)) return false

      return true
    })

    const total = seatsForResponse.length
    const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 0
    const start = (page - 1) * PAGE_SIZE
    const pagedSeats = seatsForResponse.slice(start, start + PAGE_SIZE)

    const data: SeatSearchItemDto[] = pagedSeats.map(row => {
      const open = row.openTime ? row.openTime.toString() : null
      const close = row.closeTime ? row.closeTime.toString() : null
      const timeRange = open && close ? `${formatTime(open)} - ${formatTime(close)}` : ''

      return {
        id: row.seatCode,
        label: row.seatLabel || `Seat ${row.seatCode}`,
        time: timeRange,
        date: effectiveDate ?? null,
        isAvailable: !reservedSeatIds.has(row.seatId),
        type: row.seatType ?? 'individual',
        library: {
          id: row.libraryId,
          slug: row.librarySlug ?? '',
          name: row.libraryName,
          location: row.libraryLocation ?? null,
        },
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
    console.error('Seat search error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to search seats. Please try again later.',
    })
  }
}
)
