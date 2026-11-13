import { addPostComment, listPosts, readPost, removePost, removePostComment, savePost } from '../services/posts.js'

export async function getPosts(req, res) {
  const data = await listPosts(req.query.search ?? '', req.query.page, req.query.limit)
  res.json({ error: null, data })
}

export async function getPost(req, res) {
  res.json({ error: null, data: await readPost(req.params.id) })
}

export async function createPost(req, res) {
  const data = await savePost(null, req.body, req.user.id)
  res.status(201).json({ error: null, data })
}

export async function updatePost(req, res) {
  res.json({ error: null, data: await savePost(req.params.id, req.body, req.user.id) })
}

export async function deletePost(req, res) {
  res.json({ error: null, data: await removePost(req.params.id) })
}

export async function createComment(req, res) {
  const data = await addPostComment(req.params.id, req.user.id, req.body?.content)
  res.status(201).json({ error: null, data })
}

export async function deleteComment(req, res) {
  res.json({ error: null, data: await removePostComment(req.params.id, req.params.commentId) })
}
