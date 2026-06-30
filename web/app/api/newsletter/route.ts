import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, firstName, lastName, company, jobTitle, country } = body

    if (!email || !firstName || !lastName || !country) {
      return NextResponse.json({ error: 'Required fields are missing.' }, { status: 400 })
    }

    // TODO: integrate with email service provider (Mailchimp, HubSpot, etc.)
    console.log('[newsletter] new subscriber:', { email, firstName, lastName, company, jobTitle, country })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
