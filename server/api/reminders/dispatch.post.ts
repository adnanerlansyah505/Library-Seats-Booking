import type { H3Event } from 'h3'
import { createError, getHeader } from 'h3'
import { and, eq, lte } from 'drizzle-orm'

import { db } from '../../db/client'
import { libraries } from '../../db/schemas/libraries'
import { librarySeats } from '../../db/schemas/seats'
import { reservations } from '../../db/schemas/reservations'
import { reservationReminders } from '../../db/schemas/reminders'
import { users } from '../../db/schemas/users'
import { sendReservationReminderEmail } from '../../lib/mailer'

interface DispatchResultItem {
  reminderId: number
  status: 'sent' | 'failed'
  error?: string
}

interface DispatchResponse {
  data: {
    processed: number
    results: DispatchResultItem[]
  }
}

export default defineEventHandler(async (event: H3Event): Promise<DispatchResponse> => {
  // Optional simple auth for cron jobs: if REMINDER_DISPATCH_TOKEN is set,
  // require matching X-Cron-Token header.
  const dispatchToken = process.env.REMINDER_DISPATCH_TOKEN
  if (dispatchToken) {
    const headerToken = getHeader(event, 'x-cron-token')
    if (!headerToken || headerToken !== dispatchToken) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
  }

  const now = new Date()

  try {
    const due = await db
      .select({
        reminderId: reservationReminders.id,
        reservationId: reservationReminders.reservationId,
        sendAt: reservationReminders.sendAt,
        userEmail: users.email,
        libraryName: libraries.name,
        libraryLocation: libraries.location,
        seatCode: librarySeats.code,
        seatLabel: librarySeats.label,
        reservedDate: reservations.reservedDate,
        startTime: reservations.startTime,
        endTime: reservations.endTime,
      })
      .from(reservationReminders)
      .innerJoin(reservations, eq(reservationReminders.reservationId, reservations.id))
      .innerJoin(users, eq(reservations.userId, users.id))
      .leftJoin(libraries, eq(reservations.libraryId, libraries.id))
      .leftJoin(librarySeats, eq(reservations.seatId, librarySeats.id))
      .where(
        and(
          eq(reservationReminders.status, 'scheduled'),
          eq(reservationReminders.channel, 'email'),
          lte(reservationReminders.sendAt, now),
        ),
      )
      .limit(50)

    const results: DispatchResultItem[] = []

    for (const item of due) {
      try {
        await sendReservationReminderEmail({
          to: item.userEmail,
          libraryName: item.libraryName ?? null,
          libraryLocation: item.libraryLocation ?? null,
          seatLabel: item.seatLabel ?? null,
          seatCode: item.seatCode ?? null,
          reservedDate: item.reservedDate ? item.reservedDate.toString() : null,
          startTime: item.startTime ? item.startTime.toString() : null,
          endTime: item.endTime ? item.endTime.toString() : null,
        })

        await db
          .update(reservationReminders)
          .set({
            status: 'sent',
            sentAt: new Date(),
          })
          .where(eq(reservationReminders.id, item.reminderId))

        results.push({ reminderId: item.reminderId, status: 'sent' })
      }
      catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Failed to send reminder email:', error)

        await db
          .update(reservationReminders)
          .set({
            status: 'failed',
            errorMessage: error?.message || 'Failed to send email',
          })
          .where(eq(reservationReminders.id, item.reminderId))

        results.push({
          reminderId: item.reminderId,
          status: 'failed',
          error: error?.message || 'Failed to send email',
        })
      }
    }

    return {
      data: {
        processed: results.length,
        results,
      },
    }
  }
  catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Reminder dispatch error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to dispatch reminders. Please try again later.',
    })
  }
})
