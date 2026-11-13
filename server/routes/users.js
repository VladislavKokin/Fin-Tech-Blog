import { Router } from 'express'
import { deleteUser, getUsers, patchUserRole } from '../controllers/users.js'
import { requireDatabase } from '../middlewares/require-database.js'
import { allowRoles, authenticated } from '../middlewares/authenticated.js'
import { ROLE } from '../../shared/constants/index.js'

export const usersRouter = Router()
const admin = [requireDatabase, authenticated, allowRoles(ROLE.ADMIN)]

usersRouter.get('/', ...admin, getUsers)
usersRouter.patch('/:id/role', ...admin, patchUserRole)
usersRouter.delete('/:id', ...admin, deleteUser)
