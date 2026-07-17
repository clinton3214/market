import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

const usersFilePath = path.join(process.cwd(), 'data', 'users.json')

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const usersData = fs.readFileSync(usersFilePath, 'utf8')
    const users = JSON.parse(usersData)

    if (users.find((u: any) => u.email === email)) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = {
      id: String(Date.now()),
      name,
      email,
      password: hashedPassword
    }

    users.push(newUser)
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2))

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
