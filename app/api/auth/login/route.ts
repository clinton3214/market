import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { sendVerificationEmail } from '@/lib/mailer'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    await dbConnect()

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (user.isVerified === false) {
      // Automatically resend verification email on login attempt
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
      
      user.verificationCode = verificationCode
      user.verificationCodeExpiresAt = verificationCodeExpiresAt
      await user.save()

      await sendVerificationEmail(email, verificationCode)

      return NextResponse.json({ 
        error: 'Please verify your email first', 
        isVerified: false,
        email: user.email 
      }, { status: 403 })
    }

    const response = NextResponse.json({
      message: 'Logged in successfully',
      user: { id: user._id, name: user.name, email: user.email }
    }, { status: 200 })

    response.cookies.set('auth_token', user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    return response
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
