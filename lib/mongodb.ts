import mongoose from 'mongoose'

// We are hardcoding the connection string here as requested so you don't need ENV variables on Render.
const MONGODB_URI = "mongodb+srv://clinton:Chid1234.@travis-pay.dbyddm8.mongodb.net/travis_pay?retryWrites=true&w=majority&appName=travis-pay";

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI in lib/mongodb.ts')
}

// @ts-ignore
let cached = global.mongoose

if (!cached) {
  // @ts-ignore
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }
  
  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default dbConnect
