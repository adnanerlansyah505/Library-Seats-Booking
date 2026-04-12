import type { H3Event } from 'h3'
import { createError, getHeader, readBody } from 'h3'
import { and, eq } from 'drizzle-orm'

import type { JwtPayload } from '~/utils/types/auth.types'
import { db } from '../../db/client'
import { reservations } from '../../db/schemas/reservations'
import { reservationReminders } from '../../db/schemas/reminders'
import { verifyToken } from '../../utils/authTokens'

interface CreateReminderBody {
  reservationId?: number
  offsetMinutes?: number
}

interface ReminderDto {
  id: number
  reservationId: number
  channel: 'email' | 'push'
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled'
  sendAt: string
  sentAt: string | null
  errorMessage: string | null
}

export default defineEventHandler(async (event: H3Event): Promise<{ data: ReminderDto }> => {
  const authHeader = getHeader(event, 'authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const token = authHeader.slice('Bearer '.length).trim()
  const payload = verifyToken<JwtPayload>(token)

  const body = await readBody<CreateReminderBody>(event)
  const { reservationId } = body
  const offsetMinutes = body.offsetMinutes ?? 15

  if (!reservationId) {
    throw createError({ statusCode: 400, statusMessage: 'reservationId is required' })
  }

  try {
    // Ensure the reservation exists and belongs to the current user
    const [reservation] = await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.id, reservationId),
          eq(reservations.userId, payload.id),
        ),
      )
      .limit(1)

    if (!reservation) {
      throw createError({ statusCode: 404, statusMessage: 'Reservation not found' })
    }

    const baseTimeValue = reservation.startTime || reservation.reservedDate || new Date()
  const baseTime = baseTimeValue instanceof Date ? baseTimeValue : new Date(baseTimeValue)

  const sendAt = new Date(baseTime.getTime() - offsetMinutes * 60 * 1000)

    const [created] = await db
      .insert(reservationReminders)
      .values({
        reservationId,
        channel: 'email',
        sendAt,
      })
      .returning()

    if (!created) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to create reminder' })
    }

    const dto: ReminderDto = {
      id: created.id,
      reservationId: created.reservationId,
      channel: created.channel,
      status: created.status,
      sendAt: created.sendAt.toISOString(),
      sentAt: created.sentAt ? created.sentAt.toISOString() : null,
      errorMessage: created.errorMessage ?? null,
    }

    return { data: dto }
  }
  catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Create reminder error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to create reminder. Please try again later.',
    })
  }
})
