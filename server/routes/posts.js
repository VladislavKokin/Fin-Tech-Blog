import { Router } from 'express'
import { createComment, createPost, deleteComment, deletePost, getPost, getPosts, updatePost } from '../controllers/posts.js'
import { requireDatabase } from '../middlewares/require-database.js'
import { allowRoles, authenticated } from '../middlewares/authenticated.js'
import { ROLE } from '../../shared/constants/index.js'

export const postsRouter = Router()
const admin = [requireDatabase, authenticated, allowRoles(ROLE.ADMIN)]

postsRouter.get('/', requireDatabase, getPosts)
postsRouter.post('/', ...admin, createPost)
postsRouter.get('/:id', requireDatabase, getPost)
postsRouter.put('/:id', ...admin, updatePost)
postsRouter.delete('/:id', ...admin, deletePost)
postsRouter.post('/:id/comments', requireDatabase, authenticated, allowRoles(ROLE.ADMIN, ROLE.MODERATOR, ROLE.READER), createComment)
postsRouter.delete('/:id/comments/:commentId', requireDatabase, authenticated, allowRoles(ROLE.ADMIN, ROLE.MODERATOR), deleteComment)
