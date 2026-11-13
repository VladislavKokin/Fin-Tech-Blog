import mongoose from 'mongoose'
import { isDatabaseReady } from '../config/database.js'
import { User } from '../models/User.js'
import { mapUser } from './map-data.js'
import { verifyToken } from './token.js'

export async function getCurrentUser(req) {
  const token = req.cookies?.token
  if (typeof token !== 'string' || !isDatabaseReady()) return null
  const payload = verifyToken(token)
  if (!payload || typeof payload === 'string' || !mongoose.isObjectIdOrHexString(payload.sub)) return null
  const user = await User.findById(payload.sub).select('login roleId registeredAt').lean()
  return user ? mapUser(user) : null
}
