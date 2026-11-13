import { randomBytes } from 'node:crypto'
import process from 'node:process'
import jwt from 'jsonwebtoken'

const developmentSecret = randomBytes(48).toString('hex')
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000

export function initializeAuth() {
  const secret = process.env.JWT_SECRET?.trim()
  if (process.env.NODE_ENV === 'production' && (!secret || secret.length < 32)) {
    throw new Error('В production задайте JWT_SECRET длиной не менее 32 символов.')
  }
  return secret || developmentSecret
}

export const createToken = (userId) => jwt.sign({}, initializeAuth(), {
  subject: String(userId), expiresIn: '7d', algorithm: 'HS256', issuer: 'blog',
})

export function verifyToken(token) {
  try {
    return jwt.verify(token, initializeAuth(), { algorithms: ['HS256'], issuer: 'blog' })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError || error instanceof jwt.NotBeforeError) return null
    throw error
  }
}

const cookieOptions = () => ({
  httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/',
})

export function setSessionCookie(res, userId) {
  res.cookie('token', createToken(userId), { ...cookieOptions(), maxAge: SESSION_DURATION_MS })
}

export function clearSessionCookie(res) {
  res.clearCookie('token', cookieOptions())
}
