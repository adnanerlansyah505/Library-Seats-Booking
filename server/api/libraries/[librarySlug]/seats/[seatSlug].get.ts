import type { H3Event } from 'h3'
import { createError } from 'h3'
import { eq } from 'drizzle-orm'

import { db } from '../../../../db/client'
import { libraries } from '../../../../db/schemas/libraries'
import { librarySeats } from '../../../../db/schemas/seats'

interface LibrarySeatDetailDto {
  id: string
  code: string
  label: string
  type: string
  floor: number | null
  area: string | null
  openTime: string | null
  closeTime: string | null
  library: {
    id: number
    slug: string
    name: string
    description: string | null
    location: string | null
    ownerName: string | null
    image: string | null
  }
}

export default defineEventHandler(async (event: H3Event): Promise<LibrarySeatDetailDto> => {
  const { librarySlug, seatSlug } = event.context.params as { librarySlug?: string; seatSlug?: string }

  if (!librarySlug || !seatSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'librarySlug and seatSlug are required',
    })
  }

  try {
    // Find the library by slug
    const [library] = await db
      .select()
      .from(libraries)
      .where(eq(libraries.slug, librarySlug))
      .limit(1)

    if (!library) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Library not found',
      })
    }

    // Find the seat for this library, matching by code (case-insensitive) or slug if available
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
      throw createError({
        statusCode: 404,
        statusMessage: 'Seat not found',
      })
    }

    return {
      id: seat.code,
      code: seat.code,
      label: seat.label || `Seat ${seat.code}`,
      type: seat.type ?? 'individual',
      floor: seat.floor ?? null,
      area: seat.area ?? null,
      openTime: seat.openTime ? seat.openTime.toString() : null,
      closeTime: seat.closeTime ? seat.closeTime.toString() : null,
      library: {
        id: library.id,
        slug: library.slug ?? '',
        name: library.name,
        description: library.description ?? null,
        location: library.location ?? null,
        ownerName: library.ownerName ?? null,
        image: library.image ?? null,
      },
    }
  }
  catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Seat detail error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to fetch seat detail. Please try again later.',
    })
  }
})
