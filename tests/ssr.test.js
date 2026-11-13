import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { loadPage } from '../server/load-page.js'
import { makeStore } from '../src/store/store.js'
import { serializeState, renderTemplate } from '../server/helpers/render-template.js'

const admin = { id: '507f1f77bcf86cd799439011', login: 'admin', roleId: 0, registeredAt: '2026-11-13 09:00' }
const post = {
  id: '507f1f77bcf86cd799439012', title: 'Статья на сервере', imageUrl: '',
  content: { introduction: 'Начало статьи', body: 'Основной текст статьи', conclusion: 'Заключение' },
  publishedAt: '2026-11-13 09:00', comments: [], commentsCount: 0,
}
const services = {
  listPosts: async (searchPhrase, page) => ({ posts: [post], searchPhrase, page: Number(page), lastPage: 3 }),
  readPost: async () => post,
  listUsers: async () => [admin],
  listRoles: async () => [{ id: 0, name: 'Администратор' }],
}

test('state serialization preserves JSON and prevents HTML script injection', () => {
  const state = { user: { login: '</script><script>alert("x")</script>&\u2028\u2029' } }
  const serialized = serializeState(state)
  assert.equal(serialized.includes('<'), false)
  assert.deepEqual(JSON.parse(serialized), state)
  const html = renderTemplate('<head></head><main><!--app-html--></main><!--app-state-->', {
    html: '<p>$&</p>', state,
  })
  assert.ok(html.includes('<p>$&</p>'))
  assert.equal((html.match(/<script/g) || []).length, 1)
})

test('page loaders preload route data, search, pagination and protected views', async () => {
  const options = { services, ready: true, now: new Date('2026-11-13T21:30:00Z') }
  const posts = await loadPage('/posts?search=test&page=2', null, options)
  assert.equal(posts.status, 200)
  assert.equal(posts.state.posts.page, 2)
  assert.equal(posts.state.posts.searchPhrase, 'test')
  assert.equal(posts.state.posts.loaded, true)
  assert.equal(posts.state.runtime.dateLabel, '14 ноября')
  const article = await loadPage(`/post/${post.id}`, null, options)
  assert.equal(article.state.post.content.body, post.content.body)
  const users = await loadPage('/users', admin, options)
  assert.deepEqual(users.state.users.users, [admin])
  assert.equal((await loadPage('/users', null, options)).status, 401)
  const deniedEdit = await loadPage(`/post/${post.id}/edit`, { ...admin, roleId: 2 }, options)
  assert.equal(deniedEdit.status, 403)
  assert.equal(deniedEdit.state.post.loaded, true)
  assert.match(deniedEdit.state.post.error, /Доступ/)
  assert.equal((await loadPage('/not-a-page', null, options)).status, 404)
})

test('offline and missing articles render explicit page errors', async () => {
  const offline = await loadPage('/posts', null, { ready: false })
  assert.equal(offline.status, 503)
  assert.match(offline.state.posts.error, /MONGODB_URI/)
  const missing = await loadPage(`/post/${post.id}`, null, {
    ready: true,
    services: { readPost: async () => { throw Object.assign(new Error('Статья не найдена'), { status: 404 }) } },
  })
  assert.equal(missing.status, 404)
  assert.equal(missing.state.post.requestedId, post.id)
  assert.equal((await loadPage('/', null, { ready: false })).status, 200)
})

test('each request receives an isolated Redux store', () => {
  const first = makeStore({ user: admin })
  const guest = makeStore()
  first.dispatch({ type: 'SET_POST_DATA', payload: post })
  assert.equal(first.getState().user.login, admin.login)
  assert.equal(guest.getState().user.login, null)
  assert.equal(guest.getState().post.id, '')
})

test('real React SSR includes article/list/admin content and stays visible without JavaScript', async () => {
  const vite = await createServer({
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: 'custom',
  })
  try {
    const { render } = await vite.ssrLoadModule('/src/entry-server.jsx')
    const options = { services, ready: true }
    for (const [url, user, expected] of [
      ['/', null, 'Учимся инвестировать'],
      ['/posts', null, post.title],
      [`/post/${post.id}`, null, post.content.body],
      ['/users', admin, 'Дата регистрации'],
      [`/post/${post.id}/edit`, admin, 'Начало статьи'],
      [`/post/${post.id}/edit`, null, 'Доступ запрещен'],
      ['/unknown', null, 'Такая страница не существует'],
    ]) {
      const { state } = await loadPage(url, user, options)
      const result = render(url, state)
      assert.ok(result.html.includes(expected), `${url} must contain ${expected}`)
      assert.ok(result.html.includes('page-transition'))
      assert.equal(/class="page-transition"[^>]*opacity:0/.test(result.html), false)
      assert.equal(/class="[^"]*cards[^"]*"[^>]*opacity:0/.test(result.html), false)
      assert.equal(result.state.user.login, user?.login || null)
    }
    const { state } = await loadPage('/posts', null, { ready: false })
    assert.ok(render('/posts', state).html.includes('MONGODB_URI'))
  } finally {
    await vite.close()
  }
})
