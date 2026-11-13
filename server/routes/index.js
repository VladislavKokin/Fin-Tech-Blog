import { Router } from 'express'
import { authRouter } from './auth.js'
import { postsRouter } from './posts.js'
import { usersRouter } from './users.js'
import { getRoles } from '../controllers/users.js'
import { sameOrigin } from '../middlewares/same-origin.js'
import { requireDatabase } from '../middlewares/require-database.js'
import { allowRoles, authenticated } from '../middlewares/authenticated.js'
import { ROLE } from '../../shared/constants/index.js'
import { HttpError } from '../helpers/http-error.js'

export const apiRouter = Router()
apiRouter.use(sameOrigin)
apiRouter.use('/auth', authRouter)
apiRouter.use('/posts', postsRouter)
apiRouter.use('/users', usersRouter)
apiRouter.get('/roles', requireDatabase, authenticated, allowRoles(ROLE.ADMIN), getRoles)
apiRouter.use((req, res, next) => next(new HttpError(404, 'API маршрут не найден.')))
