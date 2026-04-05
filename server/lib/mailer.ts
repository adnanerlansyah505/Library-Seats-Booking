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
