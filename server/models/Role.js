import mongoose from 'mongoose'
import { ROLE } from '../../shared/constants/index.js'

const roleSchema = new mongoose.Schema({
  _id: { type: Number, required: true, enum: Object.values(ROLE) },
  name: { type: String, required: true, maxlength: 100 },
}, { collection: 'roles', versionKey: false, bufferCommands: false })

export const Role = mongoose.models.Role || mongoose.model('Role', roleSchema)
