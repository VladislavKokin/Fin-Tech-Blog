import mongoose from 'mongoose'

mongoose.set('bufferCommands', false)

export const isDatabaseReady = () => mongoose.connection.readyState === 1

export async function connectDatabase(uri) {
  if (!uri?.trim()) return false
  // Set MONGODB_URI in the root .env file; never expose it to browser code.
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  return true
}

export async function disconnectDatabase() {
  await mongoose.disconnect()
}
