import type { H3Event } from 'h3'
import { createError, readBody } from 'h3'

interface SetupCronBody {
  // Optional: allow overriding schedule/timezone via body if needed later
  timezone?: string
}

interface SetupCronResponse {
  data: {
    jobId: number
  }
}

const CRON_API_ENDPOINT = 'https://api.cron-job.org/jobs'

export default defineEventHandler(async (event: H3Event): Promise<SetupCronResponse> => {
  const apiKey = process.env.CRON_JOB_API_KEY
  const targetUrl = process.env.REMINDER_DISPATCH_URL

  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'CRON_JOB_API_KEY is not configured' })
  }

  if (!targetUrl) {
    throw createError({ statusCode: 500, statusMessage: 'REMINDER_DISPATCH_URL is not configured' })
  }

  const body = (await readBody<SetupCronBody>(event)) || {}
  const timezone = body.timezone || 'UTC'

  const jobTitle = 'Library Seat Reminder Dispatch'

  const payload = {
    job: {
      url: targetUrl,
      enabled: true,
      saveResponses: false,
      title: jobTitle,
      requestMethod: 1, // POST
      schedule: {
        timezone,
        expiresAt: 0,
        // Every minute
        minutes: [-1],
        hours: [-1],
        mdays: [-1],
        months: [-1],
        wdays: [-1],
      },
    },
  }

  try {
    const res = await fetch(CRON_API_ENDPOINT, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json().catch(() => ({})) as { jobId?: number; [key: string]: any }

    if (!res.ok || typeof data.jobId !== 'number') {
      // eslint-disable-next-line no-console
      console.error('Failed to create cron-job.org job:', res.status, data)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create cron job on cron-job.org',
      })
    }

    return {
      data: {
        jobId: data.jobId,
      },
    }
  }
  catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Cron setup error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to set up cron job. Please try again later.',
    })
  }
})
