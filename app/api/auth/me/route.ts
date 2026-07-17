import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const usersFilePath = path.join(process.cwd(), 'data', 'users.json')

export async function GET(req: Request) {
  try {
    const authCookie = req.headers.get('cookie')?.split(';').find(c => c.trim().startsWith('auth_token='))
    const userId = authCookie ? authCookie.split('=')[1] : null

    if (!userId) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const usersData = fs.readFileSync(usersFilePath, 'utf8')
    const users = JSON.parse(usersData)

    const user = users.find((u: any) => u.id === userId)
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
