import mongoose from 'mongoose'
import { LOGIN_PATTERN } from '../helpers/validation.js'
import { ROLE } from '../../shared/constants/index.js'

const userSchema = new mongoose.Schema({
  login: { type: String, required: true, unique: true, match: LOGIN_PATTERN },
  passwordHash: { type: String, required: true, select: false },
  roleId: { type: Number, enum: [ROLE.ADMIN, ROLE.MODERATOR, ROLE.READER], default: ROLE.READER },
  legacyId: { type: String, unique: true, sparse: true, immutable: true, select: false },
}, { timestamps: { createdAt: 'registeredAt', updatedAt: 'updatedAt' }, bufferCommands: false })

export const User = mongoose.models.User || mongoose.model('User', userSchema)
