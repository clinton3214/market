import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { sendVerificationEmail } from '@/lib/mailer'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    await dbConnect()

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.isVerified) {
      return NextResponse.json({ error: 'User is already verified' }, { status: 400 })
    }

    // Generate new 6 digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    user.verificationCode = verificationCode
    user.verificationCodeExpiresAt = verificationCodeExpiresAt
    await user.save()

    await sendVerificationEmail(email, verificationCode)

    return NextResponse.json({ message: 'Verification code resent successfully' }, { status: 200 })
  } catch (error) {
    console.error('Resend error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
