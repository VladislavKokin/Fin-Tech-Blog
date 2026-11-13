import { authorizeUser, registerUser } from '../services/auth.js'
import { getCurrentUser } from '../helpers/current-user.js'
import { clearSessionCookie, setSessionCookie } from '../helpers/token.js'

export async function register(req, res) {
  const user = await registerUser(req.body?.login, req.body?.password)
  setSessionCookie(res, user.id)
  res.status(201).json({ error: null, data: user })
}

export async function login(req, res) {
  const user = await authorizeUser(req.body?.login, req.body?.password)
  setSessionCookie(res, user.id)
  res.json({ error: null, data: user })
}

export function logout(req, res) {
  clearSessionCookie(res)
  res.json({ error: null, data: null })
}

export async function getUser(req, res) {
  const user = await getCurrentUser(req)
  if (!user && req.cookies?.token) clearSessionCookie(res)
  res.json({ error: null, data: user })
}
