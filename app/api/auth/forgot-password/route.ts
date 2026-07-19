import { NextResponse } from 'next/server'
import crypto from 'crypto'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { sendPasswordResetEmail } from '@/lib/mailer'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    await dbConnect()

    const user = await User.findOne({ email })
    
    // We always return a success message to prevent email enumeration attacks.
    if (!user) {
      return NextResponse.json({ 
        message: 'If an account with that email exists, we sent a password reset link.' 
      }, { status: 200 })
    }

    // Note: If the user requests multiple reset links, we overwrite the previous token.
    // This immediately invalidates any older emails they might have received.
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    user.resetPasswordToken = resetToken
    user.resetPasswordExpiresAt = resetPasswordExpiresAt
    await user.save()

    // Construct the reset URL. We use req.headers to dynamically get the host.
    // Ensure we handle localhost and production properly.
    const host = req.headers.get('host') || 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const resetUrl = `${protocol}://${host}/reset-password?token=${resetToken}`

    await sendPasswordResetEmail(user.email, resetUrl)

    return NextResponse.json({ 
      message: 'If an account with that email exists, we sent a password reset link. Please check your inbox for the most recent link.' 
    }, { status: 200 })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
