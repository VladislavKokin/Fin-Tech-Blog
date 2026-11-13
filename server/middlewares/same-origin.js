import process from 'node:process'
import { HttpError } from '../helpers/http-error.js'

export function initializeOrigin() {
  const configuredOrigin = process.env.PUBLIC_ORIGIN?.trim()
  if (!configuredOrigin) return null
  try {
    const url = new URL(configuredOrigin)
    if (!/^https?:\/\//i.test(configuredOrigin) || !['http:', 'https:'].includes(url.protocol) ||
      url.username || url.password || configuredOrigin.includes('@') || url.pathname !== '/' ||
      configuredOrigin.includes('?') || configuredOrigin.includes('#')) throw new Error('Invalid origin')
    return url.origin
  } catch {
    throw new Error('PUBLIC_ORIGIN должен содержать только http(s) адрес сайта без пути, логина, пароля, query и hash.')
  }
}

export function sameOrigin(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next()
  if (req.get('sec-fetch-site') === 'cross-site') return next(new HttpError(403, 'Запрос с другого сайта запрещён.'))
  const origin = req.get('origin')
  if (!origin) return next()
  let allowed
  try {
    const expectedOrigin = initializeOrigin() || `${req.protocol}://${req.get('host')}`
    allowed = new URL(origin).origin === expectedOrigin
  } catch {
    allowed = false
  }
  if (!allowed) return next(new HttpError(403, 'Запрос с другого сайта запрещён.'))
  next()
}
