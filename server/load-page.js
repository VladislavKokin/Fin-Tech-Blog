import * as defaultServices from './services/index.js'
import { isDatabaseReady } from './config/database.js'
import { ROLE, PAGINATION_LIMIT } from '../shared/constants/index.js'

const databaseMessage = 'MongoDB не подключена. Укажите MONGODB_URI в корневом .env.'

export async function loadPage(url, user, {
  services = defaultServices,
  ready = isDatabaseReady(),
  now = new Date(),
} = {}) {
  const location = new URL(url, 'http://ssr.local')

  const path = location.pathname.toLowerCase().replace(/\/+$/, '') || '/'
  const dateLabel = new Intl.DateTimeFormat('ru', {
    day: 'numeric', month: 'long', timeZone: 'Europe/Moscow',
  }).format(now)
  const state = {
    user: user || { id: null, login: null, roleId: ROLE.GUEST },
    runtime: { dateLabel },
  }
  let status = 200
  const postMatch = path.match(/^\/post\/([^/]+)(\/edit)?$/)
  const isAdmin = user?.roleId === ROLE.ADMIN
  const searchPhrase = location.searchParams.get('search') || ''
  const pageValue = location.searchParams.get('page') || '1'
  const page = /^[1-9]\d*$/.test(pageValue) && Number.isSafeInteger(Number(pageValue)) ? Number(pageValue) : 1

  if (path === '/posts') {
    state.posts = { posts: [], page, lastPage: 1, searchPhrase, loaded: true, error: null }
  } else if (postMatch) {
    state.post = { requestedId: postMatch[1], loaded: true, error: null }
  } else if (path === '/users' && isAdmin) {
    state.users = { users: [], roles: [], loaded: true, error: null }
  }

  try {
    if ((path === '/users' || path === '/post' || postMatch?.[2]) && !isAdmin) {
      if (postMatch) state.post.error = 'Доступ запрещен'
      return { state, status: user ? 403 : 401 }
    }

    if (path === '/') return { state, status }
    if (path === '/post') return { state, status }
    if (path !== '/posts' && path !== '/users' && !postMatch) return { state, status: 404 }

    if (!ready) throw Object.assign(new Error(databaseMessage), { status: 503 })

    if (path === '/posts') {
      const result = await services.listPosts(searchPhrase, pageValue, PAGINATION_LIMIT)
      state.posts = { ...state.posts, ...result }
    } else if (postMatch) {
      let postId
      try {
        postId = decodeURIComponent(postMatch[1])
      } catch {
        throw Object.assign(new Error('Некорректный адрес статьи.'), { status: 400 })
      }
      const post = await services.readPost(postId)
      state.post = { ...post, requestedId: post.id, loaded: true, error: null }
    } else if (path === '/users') {
      const [users, roles] = await Promise.all([services.listUsers(), services.listRoles()])
      state.users = { users, roles, loaded: true, error: null }
    }
  } catch (error) {
    status = error.status || error.statusCode || 500
    const message = status < 500 || status === 503 ? error.message : 'Не удалось загрузить данные страницы.'
    const slice = path === '/posts' ? 'posts' : path === '/users' ? 'users' : 'post'
    state[slice] = { ...state[slice], loaded: true, error: message }
  }

  return { state, status }
}
