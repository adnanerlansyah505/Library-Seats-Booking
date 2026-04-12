import type { H3Event } from 'h3'
import { createError, getQuery } from 'h3'
import { and, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm'

import { db } from '../../db/client'
import { libraries } from '../../db/schemas/libraries'
import { librarySeats } from '../../db/schemas/seats'
import { reservations } from '../../db/schemas/reservations'

interface LibraryDto {
  id: number
  slug: string | null
  name: string
  description: string | null
  location: string | null
  ownerName: string | null
  totalSeats: number
}

interface LibrariesResponse {
  data: LibraryDto[]
  meta: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

const PAGE_SIZE = 10

export default defineEventHandler(async (event: H3Event): Promise<LibrariesResponse> => {
  try {
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

    // Determine the effective date for availability calculations.
    // If no date is provided, default to today.
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    const todayStr = `${yyyy}-${mm}-${dd}`

    const effectiveDate = query.date && query.date.trim().length > 0
      ? query.date.trim()
      : todayStr

    const whereClauses = [] as any[]

    if (query.q && query.q.trim().length > 0) {
      const term = `%${query.q.trim()}%`
      whereClauses.push(
        or(
          ilike(libraries.name, term),
          ilike(libraries.location, term),
        ),
      )
    }

    // Basic example: time / seatType filters could later be extended to
    // join against seats & availability. For now they are accepted but
    // not applied as DB-level constraints.

    const whereExpr = whereClauses.length > 0
      ? and(...whereClauses)
      : undefined

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(libraries)
      .where(whereExpr as any)

    const total = countResult[0]?.count ?? 0
    const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 0

    const rows = await db
      .select({
        id: libraries.id,
        slug: libraries.slug,
        name: libraries.name,
        description: libraries.description,
        location: libraries.location,
        ownerName: libraries.ownerName,
        // Count of seats that are active, have a time window, and are not
        // already reserved for the effective date.
        totalSeats: sql<number>`count(distinct case when ${reservations.id} is null then ${librarySeats.id} end)`,
      })
      .from(libraries)
      .leftJoin(
        librarySeats,
        and(
          eq(librarySeats.libraryId, libraries.id),
          eq(librarySeats.isActive, true),
          // Only consider seats with a defined open/close time window
          sql`${librarySeats.openTime} is not null`,
          sql`${librarySeats.closeTime} is not null`,
        ),
      )
      .leftJoin(
        reservations,
        and(
          eq(reservations.libraryId, libraries.id),
          eq(reservations.seatId, librarySeats.id),
          eq(reservations.reservedDate, effectiveDate as any),
          inArray(reservations.status, ['pending', 'confirmed']),
        ),
      )
      .where(whereExpr as any)
      .groupBy(
        libraries.id,
        libraries.slug,
        libraries.name,
        libraries.description,
        libraries.location,
        libraries.ownerName,
      )
      .orderBy(desc(libraries.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE)

    const data: LibraryDto[] = rows.map(lib => ({
      id: lib.id,
      slug: lib.slug ?? null,
      name: lib.name,
      description: lib.description ?? null,
      location: lib.location ?? null,
      ownerName: lib.ownerName ?? null,
      totalSeats: lib.totalSeats ?? 0,
    }))

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
    console.error('Libraries list error:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to fetch libraries. Please try again later.',
    })
  }
})
