import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

interface ContactPayload {
  first_name: string
  last_name: string
  email: string
  message: string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: NextRequest) {
  let body: ContactPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { first_name, last_name, email, message } = body

  /* ── Validation ──────────────────────────────────────────────────────── */
  if (!first_name?.trim() || !last_name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }
  if (message.trim().length < 10) {
    return NextResponse.json({ error: 'Message too short' }, { status: 400 })
  }

  /* ── Send via SMTP (nodemailer) if credentials are configured ────────── */
  const smtpHost = process.env.SMTP_HOST
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const toEmail  = process.env.CONTACT_TO_EMAIL ?? 'contact@steinbergvalentino.com'

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const nodemailer = await import('nodemailer')
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: smtpUser, pass: smtpPass },
      })

      await transporter.sendMail({
        from: `"SteinbergValentino Website" <${smtpUser}>`,
        to: toEmail,
        replyTo: email,
        subject: `New Contact Form Submission — ${first_name} ${last_name}`,
        text: [
          `Name: ${first_name} ${last_name}`,
          `Email: ${email}`,
          '',
          message,
        ].join('\n'),
        html: `
          <p><strong>Name:</strong> ${first_name} ${last_name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <hr/>
          <p>${message.replace(/\n/g, '<br/>')}</p>
        `,
      })
    } catch (err) {
      console.error('[contact/route] SMTP error:', err)
      return NextResponse.json(
        { error: 'Failed to send message. Please try again or contact us directly.' },
        { status: 500 }
      )
    }
  } else {
    /*
     * SMTP not configured yet.
     * Log to server console so the message isn't lost during development.
     * Add SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT, CONTACT_TO_EMAIL to .env.local
     * to enable real email delivery.
     */
    console.info('[contact/route] SMTP not configured — message received:', {
      from: `${first_name} ${last_name} <${email}>`,
      message,
    })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
