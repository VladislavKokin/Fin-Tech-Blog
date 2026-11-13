import { Post } from '../models/Post.js'
import { PAGINATION_LIMIT } from '../../shared/constants/index.js'
import { Comment } from '../models/Comment.js'
import { User } from '../models/User.js'
import { mapComment, mapPost } from '../helpers/map-data.js'
import { HttpError } from '../helpers/http-error.js'
import { validateComment, validateId, validatePagination, validatePost } from '../helpers/validation.js'

export async function listPosts(searchPhrase = '', page = 1, limit = PAGINATION_LIMIT) {
  const parsedPage = validatePagination(page, 1, 100000)
  const parsedLimit = validatePagination(limit, PAGINATION_LIMIT, 50)
  if (typeof searchPhrase !== 'string' || searchPhrase.length > 120) throw new HttpError(400, 'Некорректная строка поиска.')

  const search = searchPhrase.trim()
  const query = search ? { title: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } } : {}
  const [posts, total] = await Promise.all([
    Post.find(query).sort({ publishedAt: -1, _id: -1 }).skip((parsedPage - 1) * parsedLimit).limit(parsedLimit).lean(),
    Post.countDocuments(query),
  ])
  const counts = posts.length ? await Comment.aggregate([
    { $match: { post: { $in: posts.map((post) => post._id) } } },
    { $group: { _id: '$post', count: { $sum: 1 } } },
  ]) : []
  const countByPost = new Map(counts.map(({ _id, count }) => [String(_id), count]))

  return {
    posts: posts.map((post) => ({ ...mapPost(post), commentsCount: countByPost.get(String(post._id)) || 0 })),
    lastPage: Math.max(1, Math.ceil(total / parsedLimit)),
    page: parsedPage,
    searchPhrase,
  }
}

export async function readPost(id) {
  validateId(id, 'ID статьи')
  const post = await Post.findById(id).lean()
  if (!post) throw new HttpError(404, 'Такая страница не существует.')

  const comments = await Comment.find({ post: id }).sort({ publishedAt: 1, _id: 1 }).lean()
  const authorIds = [...new Set(comments.map((comment) => String(comment.author)))]
  const users = authorIds.length ? await User.find({ _id: { $in: authorIds } }).select('login').lean() : []
  const userById = new Map(users.map((user) => [String(user._id), user]))

  return {
    ...mapPost(post),
    comments: comments.map((comment) => mapComment({
      ...comment, authorId: comment.author, author: userById.get(String(comment.author)) || null,
    })),
  }
}

export async function savePost(id, input, authorId) {
  const values = validatePost(input)
  if (!id) {
    const post = await Post.create({ ...values, author: authorId })
    return { ...mapPost(post), comments: [] }
  }
  validateId(id, 'ID статьи')
  const post = await Post.findByIdAndUpdate(id, { $set: values }, { new: true, runValidators: true }).lean()
  if (!post) throw new HttpError(404, 'Статья не найдена.')
  return readPost(id)
}

export async function removePost(id) {
  validateId(id, 'ID статьи')
  const post = await Post.findByIdAndDelete(id).lean()
  if (!post) throw new HttpError(404, 'Статья не найдена.')
  await Comment.deleteMany({ post: id })
  return true
}

export async function addPostComment(postId, authorId, content) {
  validateId(postId, 'ID статьи')
  const text = validateComment(content)
  const exists = await Post.exists({ _id: postId })
  if (!exists) throw new HttpError(404, 'Статья не найдена.')
  await Comment.create({ post: postId, author: authorId, content: text })
  return readPost(postId)
}

export async function removePostComment(postId, commentId) {
  validateId(postId, 'ID статьи')
  validateId(commentId, 'ID комментария')
  const result = await Comment.deleteOne({ _id: commentId, post: postId })
  if (!result.deletedCount) throw new HttpError(404, 'Комментарий не найден.')
  return readPost(postId)
}
