import { getCurrentUser } from '../helpers/current-user.js'
import { HttpError } from '../helpers/http-error.js'
import { clearSessionCookie } from '../helpers/token.js'

export async function authenticated(req, res, next) {
  const user = await getCurrentUser(req)
  if (!user) {
    clearSessionCookie(res)
    throw new HttpError(401, 'Необходима авторизация.')
  }
  req.user = user
  next()
}

export const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.roleId)) return next(new HttpError(403, 'Доступ запрещён.'))
  next()
}
