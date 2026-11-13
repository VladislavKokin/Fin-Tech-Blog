export function formatDate(value) {
  return value ? new Date(value).toISOString().slice(0, 16).replace('T', ' ') : ''
}

export const mapUser = (user) => ({
  id: String(user._id),
  login: user.login,
  registeredAt: formatDate(user.registeredAt),
  roleId: user.roleId,
})

export const mapPost = (post) => ({
  id: String(post._id),
  title: post.title,
  imageUrl: post.imageUrl || '',
  content: {
    introduction: post.content?.introduction || '',
    body: post.content?.body || '',
    conclusion: post.content?.conclusion || '',
  },
  publishedAt: formatDate(post.publishedAt),
})

export const mapComment = (comment) => ({
  id: String(comment._id),
  postId: String(comment.post),
  authorId: comment.author?._id ? String(comment.author._id) : String(comment.authorId || comment.author || ''),
  author: comment.author?.login || 'Удалённый пользователь',
  content: comment.content,
  publishedAt: formatDate(comment.publishedAt),
})
