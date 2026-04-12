import type { H3Event } from 'h3'
import { createError, getHeader, readBody } from 'h3'
import { and, eq } from 'drizzle-orm'

import type { JwtPayload } from '~/utils/types/auth.types'
import { db } from '../../db/client'
import { reservations } from '../../db/schemas/reservations'
import { verifyToken } from '../../utils/authTokens'

interface UpdateReservationBody {
  action?: 'cancel'
}

interface UpdateReservationResponse {
  data: {
    id: number
    status: string
  }
}

export default defineEventHandler(async (event: H3Event): Promise<UpdateReservationResponse> => {
  const authHeader = getHeader(event, 'authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const token = authHeader.slice('Bearer '.length).trim()
  const payload = verifyToken<JwtPayload>(token)

  const idParam = event.context.params?.id
  const id = Number.parseInt(String(idParam ?? ''), 10)

  if (!id || Number.isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid reservation id' })
  }

  const body = await readBody<UpdateReservationBody>(event)

  if (body.action !== 'cancel') {
    throw createError({ statusCode: 400, statusMessage: 'Unsupported reservation update action' })
  }

  try {
    const [existing] = await db
      .select()
      .from(reservations)
      .where(and(
        eq(reservations.id, id),
        eq(reservations.userId, payload.id),
      ))
      .limit(1)

    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'Reservation not found' })
    }

    if (!['pending', 'confirmed'].includes(existing.status as any)) {
      throw createError({ statusCode: 409, statusMessage: 'Only pending or confirmed reservations can be cancelled' })
    }

    const [updated] = await db
      .update(reservations)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(and(
        eq(reservations.id, id),
        eq(reservations.userId, payload.id),
      ))
      .returning({ id: reservations.id, status: reservations.status })

    if (!updated) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to cancel reservation' })
    }

    return { data: { id: updated.id, status: updated.status ?? 'cancelled' } }
  }
  catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Update reservation error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to update reservation. Please try again later.',
    })
  }
})
