import { User } from '../models/User.js'
import { ROLES } from '../../shared/constants/index.js'
import { mapUser } from '../helpers/map-data.js'
import { validateId, validateRole } from '../helpers/validation.js'
import { HttpError } from '../helpers/http-error.js'

export async function listUsers() {
  const users = await User.find().select('login roleId registeredAt').sort({ registeredAt: -1, _id: -1 }).lean()
  return users.map(mapUser)
}

export const listRoles = () => ROLES.map((role) => ({ ...role }))

export async function updateUserRole(id, roleId) {
  validateId(id, 'ID пользователя')
  validateRole(roleId)
  const user = await User.findByIdAndUpdate(id, { $set: { roleId } }, { new: true, runValidators: true }).lean()
  if (!user) throw new HttpError(404, 'Пользователь не найден.')
  return mapUser(user)
}

export async function removeUser(id) {
  validateId(id, 'ID пользователя')
  const user = await User.findByIdAndDelete(id).lean()
  if (!user) throw new HttpError(404, 'Пользователь не найден.')
  // Comments remain part of their articles; readPost labels a missing author.
  return true
}
