import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { HttpError } from '../helpers/http-error.js'
import { validateCredentials } from '../helpers/validation.js'
import { mapUser } from '../helpers/map-data.js'
import { ROLE } from '../../shared/constants/index.js'

async function createUser(login, password, roleId) {
  const credentials = validateCredentials({ login, password })
  const existing = await User.findOne({ login: credentials.login }).lean()
  if (existing) throw new HttpError(409, 'Логин уже занят, попробуйте другой.')

  const passwordHash = await bcrypt.hash(credentials.password, 12)
  try {
    const user = await User.create({ login: credentials.login, passwordHash, roleId })
    return mapUser(user)
  } catch (error) {
    if (error.code === 11000) throw new HttpError(409, 'Логин уже занят, попробуйте другой.')
    throw error
  }
}

export const registerUser = (login, password) => createUser(login, password, ROLE.READER)


export const createAdmin = (login, password) => createUser(login, password, ROLE.ADMIN)

export async function authorizeUser(login, password) {
  const credentials = validateCredentials({ login, password })
  const user = await User.findOne({ login: credentials.login }).select('+passwordHash').lean()
  if (!user || typeof user.passwordHash !== 'string' || !await bcrypt.compare(credentials.password, user.passwordHash)) {
    throw new HttpError(401, 'Неверный логин или пароль.')
  }
  return mapUser(user)
}
