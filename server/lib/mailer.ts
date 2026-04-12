import nodemailer from 'nodemailer'

const smtpHost = process.env.SMTP_HOST
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!smtpHost || !smtpUser || !smtpPass) {
    // eslint-disable-next-line no-console
    console.warn('[mailer] SMTP is not fully configured; emails will not be sent.')
    return null
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  }

  return transporter
}

export async function sendPasswordResetCode(to: string, code: string) {
  const tx = getTransporter()
  if (!tx) return

  const from = `Library Seats <${smtpUser}>`

  const html = `
    <p>Hello,</p>
    <p>Your password reset code is <strong>${code}</strong>.</p>
    <p>This code will expire in 5 minutes. If you did not request a password reset, you can ignore this email.</p>
  `

  const text = `Your password reset code is ${code}. It will expire in 5 minutes. If you did not request a password reset, you can ignore this email.`

  try {
    await tx.sendMail({
      from,
      to,
      subject: 'Reset your Library Seats password',
      text,
      html,
    })
  }
  catch (error) {
    // eslint-disable-next-line no-console
    console.error('[mailer] Failed to send password reset email:', error)
  }
}

interface ReservationReminderEmailPayload {
  to: string
  libraryName: string | null
  libraryLocation: string | null
  seatLabel: string | null
  seatCode: string | null
  reservedDate: string | null
  startTime: string | null
  endTime: string | null
}

export async function sendReservationReminderEmail(payload: ReservationReminderEmailPayload) {
  const tx = getTransporter()
  if (!tx) {
    throw new Error('[mailer] SMTP is not configured; cannot send reservation reminder')
  }

  const {
    to,
    libraryName,
    libraryLocation,
    seatLabel,
    seatCode,
    reservedDate,
    startTime,
    endTime,
  } = payload

  const from = `Library Seats <${smtpUser}>`

  const libraryLine = libraryName || 'your library'
  const locationLine = libraryLocation ? ` (${libraryLocation})` : ''
  const seatLine = seatLabel || (seatCode ? `Seat ${seatCode}` : 'your seat')

  const datePart = reservedDate ? `on ${reservedDate}` : 'soon'

  const timePart = startTime && endTime
    ? ` from ${new Date(startTime).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} to ${new Date(endTime).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`
    : ''

  const subject = 'Reminder: Upcoming library seat reservation'

  const text = `This is a reminder for your reservation at ${libraryLine}${locationLine} for ${seatLine} ${datePart}${timePart}. Please arrive a few minutes early.`

  const html = `
    <p>Hello,</p>
    <p>This is a reminder for your upcoming library seat reservation.</p>
    <ul>
      <li><strong>Library:</strong> ${libraryLine}${locationLine}</li>
      <li><strong>Seat:</strong> ${seatLine}</li>
      ${reservedDate ? `<li><strong>Date:</strong> ${reservedDate}</li>` : ''}
      ${startTime && endTime ? `<li><strong>Time:</strong> ${new Date(startTime).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} - ${new Date(endTime).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</li>` : ''}
    </ul>
    <p>Please arrive a few minutes early to get settled.</p>
  `

  try {
    await tx.sendMail({
      from,
      to,
      subject,
      text,
      html,
    })
  }
  catch (error) {
    // eslint-disable-next-line no-console
    console.error('[mailer] Failed to send reservation reminder email:', error)
    throw error
  }
}
