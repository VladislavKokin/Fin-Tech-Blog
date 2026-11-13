import { Router } from 'express'
import { getUser, login, logout, register } from '../controllers/auth.js'
import { requireDatabase } from '../middlewares/require-database.js'

export const authRouter = Router()
authRouter.post('/register', requireDatabase, register)
authRouter.post('/login', requireDatabase, login)
authRouter.post('/logout', logout)
authRouter.get('/me', requireDatabase, getUser)
