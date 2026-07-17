import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(req: Request) {
  try {
    const authCookie = req.headers.get('cookie')?.split(';').find(c => c.trim().startsWith('auth_token='))
    const userId = authCookie ? authCookie.split('=')[1] : null

    if (!userId) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    await dbConnect()

    const user = await User.findById(userId)
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({ user: { id: user._id, name: user.name, email: user.email } }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
