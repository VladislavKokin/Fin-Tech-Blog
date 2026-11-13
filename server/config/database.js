import mongoose from 'mongoose'

mongoose.set('bufferCommands', false)


mongoose.set('autoCreate', false)
mongoose.set('autoIndex', false)

export const isDatabaseReady = () => mongoose.connection.readyState === 1

export async function connectDatabase(uri) {
  if (!uri?.trim()) return false

  const dbName = process.env.MONGODB_DB_NAME?.trim()
  if (dbName && !/^[A-Za-z0-9_-]{1,63}$/.test(dbName)) {
    throw new Error('MONGODB_DB_NAME должен содержать до 63 букв, цифр, _ или -.')
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, ...(dbName ? { dbName } : {}) })
  await Promise.all(Object.values(mongoose.models).map(async (model) => {
    await model.createCollection()
    await model.createIndexes()
  }))
  return true
}

export async function disconnectDatabase() {
  await mongoose.disconnect()
}
