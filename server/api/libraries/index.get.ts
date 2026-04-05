import type { H3Event } from 'h3'
import { createError } from 'h3'
import { desc } from 'drizzle-orm'

import { db } from '../../db/client'
import { libraries } from '../../db/schemas/libraries'

interface Library {
  id: number
  name: string
  description: string | null
  location: string | null
  ownerName: string | null
}

interface LibrariesResponse {
  data: Library[]
}

export default defineEventHandler(async (_event: H3Event): Promise<LibrariesResponse> => {
  try {
    const rows = await db
      .select()
      .from(libraries)
      .orderBy(desc(libraries.createdAt))
      .limit(5)

    return { data: rows }
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
