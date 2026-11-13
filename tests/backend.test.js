import assert from 'node:assert/strict'
import { test } from 'node:test'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import * as auth from '../server/controllers/auth.js'
import * as posts from '../server/controllers/posts.js'
import * as users from '../server/controllers/users.js'
import { User } from '../server/models/User.js'
import { Post } from '../server/models/Post.js'
import { Comment } from '../server/models/Comment.js'
import { postsRouter } from '../server/routes/posts.js'
import { usersRouter } from '../server/routes/users.js'
import { authRouter } from '../server/routes/auth.js'
import { apiRouter } from '../server/routes/index.js'
import { createToken, verifyToken } from '../server/helpers/token.js'
import { sameOrigin, initializeOrigin } from '../server/middlewares/same-origin.js'
import { errorHandler } from '../server/middlewares/error-handler.js'
import { ROLE } from '../shared/constants/index.js'

const userId = '507f1f77bcf86cd799439011'
const otherUserId = '507f1f77bcf86cd799439012'
const postId = '507f1f77bcf86cd799439013'
const commentId = '507f1f77bcf86cd799439014'
const password = 'CorrectPassword123!'
const user = { _id: userId, login: 'reader_1', roleId: ROLE.READER, registeredAt: new Date('2026-01-02T10:30:00Z') }
const content = { introduction: 'Введение', body: 'Основной текст', conclusion: 'Заключение' }
const post = { _id: postId, title: 'Статья', imageUrl: '/Post/cover.svg', content, publishedAt: new Date('2026-01-03T12:00:00Z') }

// Run real controller and middleware functions without opening a socket. Only
// mongoose persistence methods are replaced; bcrypt, JWT and validators are real.
function query(value) {
  return {
    select() { return this }, sort() { return this }, skip() { return this }, limit() { return this },
    async lean() { return value },
  }
}

function response() {
  return {
    statusCode: 200, body: undefined, cookies: [], clearedCookies: [],
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this },
    cookie(...args) { this.cookies.push(args); return this },
    clearCookie(...args) { this.clearedCookies.push(args); return this },
  }
}

function request(overrides = {}) {
  return {
    body: {}, params: { id: postId, commentId }, query: {}, cookies: {}, method: 'GET', protocol: 'http',
    headers: { host: 'localhost:5173' },
    get(name) { return this.headers[name.toLowerCase()] },
    ...overrides,
  }
}

function ready(t, value = true) {
  const descriptor = Object.getOwnPropertyDescriptor(mongoose.connection, 'readyState')
  Object.defineProperty(mongoose.connection, 'readyState', { configurable: true, get: () => value ? 1 : 0 })
  t.after(() => {
    if (descriptor) Object.defineProperty(mongoose.connection, 'readyState', descriptor)
    else delete mongoose.connection.readyState
  })
}

function session() { return { token: createToken(userId) } }

function mockUser(t, value = user) {
  return t.mock.method(User, 'findById', () => query(value))
}

function mockPostDetails(t, comments = [], authors = []) {
  t.mock.method(Post, 'findById', () => query(post))
  t.mock.method(Comment, 'find', () => query(comments))
  t.mock.method(User, 'find', () => query(authors))
}

async function rejectsStatus(action, status) {
  await assert.rejects(action, (error) => {
    assert.equal(error.status, status, error.message)
    assert.equal(typeof error.message, 'string')
    return true
  })
}

async function runHandlers(handlers, req, res) {
  for (const handler of handlers) {
    let advanced = false
    let failure
    await handler(req, res, (error) => { advanced = true; failure = error })
    if (failure) throw failure
    if (!advanced) return res
  }
  return res
}

function runRoute(router, method, path, req, res = response()) {
  const route = router.stack.find((layer) => layer.route?.path === path && layer.route.methods[method])?.route
  assert.ok(route, `Missing route ${method.toUpperCase()} ${path}`)
  return runHandlers(route.stack.map((layer) => layer.handle), req, res)
}

test('backend behavior with mocked persistence and no network listeners', { timeout: 30000 }, async (t) => {
  const passwordHash = await bcrypt.hash(password, 4)

  await t.test('offline database routes fail before persistence, but logout remains available', async (t) => {
    ready(t, false)
    const find = t.mock.method(User, 'findOne', () => assert.fail('Offline request reached mongoose'))
    await rejectsStatus(() => runRoute(authRouter, 'post', '/register', request({ body: { login: user.login, password } })), 503)
    await rejectsStatus(() => runRoute(postsRouter, 'get', '/', request()), 503)
    const logout = await runRoute(authRouter, 'post', '/logout', request())
    assert.deepEqual(logout.body, { error: null, data: null })
    assert.equal(logout.clearedCookies[0][0], 'token')
    assert.equal(find.mock.callCount(), 0)
  })

  await t.test('registration validates login and password before database access', async (t) => {
    const find = t.mock.method(User, 'findOne', () => assert.fail('Invalid credentials reached mongoose'))
    for (const body of [
      { login: 'ab', password }, { login: 'invalid login', password }, { login: { $ne: null }, password },
      { login: user.login, password: 'weak' }, { login: user.login, password: null },
    ]) await rejectsStatus(() => auth.register(request({ body }), response()), 400)
    assert.equal(find.mock.callCount(), 0)
  })

  await t.test('registration hashes the password and cannot inject an elevated role', async (t) => {
    t.mock.method(User, 'findOne', (filter) => {
      assert.deepEqual(filter, { login: user.login })
      return query(null)
    })
    let saved
    t.mock.method(User, 'create', async (value) => { saved = value; return { ...user, ...value } })
    const res = response()
    await auth.register(request({ body: { login: user.login, password, roleId: ROLE.ADMIN, passwordHash: 'injected' } }), res)
    assert.equal(res.statusCode, 201)
    assert.equal(saved.roleId, ROLE.READER)
    assert.equal(Object.hasOwn(saved, 'password'), false)
    assert.notEqual(saved.passwordHash, password)
    assert.equal(await bcrypt.compare(password, saved.passwordHash), true)
    assert.deepEqual(Object.keys(res.body.data).sort(), ['id', 'login', 'registeredAt', 'roleId'])
    assert.equal(res.body.data.login, user.login)
    const [name, token, options] = res.cookies[0]
    assert.equal(name, 'token')
    assert.equal(verifyToken(token).sub, userId)
    assert.equal(options.httpOnly, true)
    assert.equal(options.sameSite, 'lax')
    assert.equal(options.path, '/')
    assert.ok(options.maxAge > 0)
  })

  await t.test('duplicate logins and unique-index races return 409', async (t) => {
    let existing = user
    t.mock.method(User, 'findOne', () => query(existing))
    const create = t.mock.method(User, 'create', async () => { throw Object.assign(new Error('Duplicate'), { code: 11000 }) })
    const req = request({ body: { login: user.login, password } })
    await rejectsStatus(() => auth.register(req, response()), 409)
    assert.equal(create.mock.callCount(), 0)
    existing = null
    await rejectsStatus(() => auth.register(req, response()), 409)
    assert.equal(create.mock.callCount(), 1)
  })

  await t.test('login gives one error for missing users and incorrect passwords', async (t) => {
    let found = null
    t.mock.method(User, 'findOne', () => query(found))
    const req = request({ body: { login: user.login, password } })
    let missingMessage
    await assert.rejects(() => auth.login(req, response()), (error) => {
      assert.equal(error.status, 401); missingMessage = error.message; return true
    })
    found = { ...user, passwordHash }
    req.body.password = 'WrongPassword123!'
    await assert.rejects(() => auth.login(req, response()), (error) => {
      assert.equal(error.status, 401); assert.equal(error.message, missingMessage); return true
    })
    req.body.password = password
    const res = response()
    await auth.login(req, res)
    assert.equal(res.body.data.id, userId)
    assert.equal(Object.hasOwn(res.body.data, 'passwordHash'), false)
    assert.equal(verifyToken(res.cookies[0][1]).sub, userId)
  })

  await t.test('sessions use the current database role and reject tampered or removed users', async (t) => {
    ready(t)
    let current = { ...user, roleId: ROLE.MODERATOR }
    const find = t.mock.method(User, 'findById', () => query(current))
    const req = request({ cookies: session() })
    const active = response()
    await auth.getUser(req, active)
    assert.equal(active.body.data.roleId, ROLE.MODERATOR)
    current = null
    const removed = response()
    await auth.getUser(req, removed)
    assert.equal(removed.body.data, null)
    assert.equal(removed.clearedCookies.length, 1)
    const calls = find.mock.callCount()
    const invalid = response()
    await auth.getUser(request({ cookies: { token: `${createToken(userId)}tampered` } }), invalid)
    assert.equal(invalid.body.data, null)
    assert.equal(find.mock.callCount(), calls)
  })

  await t.test('actual admin route stacks reject readers and moderators despite forged request roles', async (t) => {
    ready(t)
    let current = user
    t.mock.method(User, 'findById', () => query(current))
    for (const [model, name] of [
      [Post, 'create'], [Post, 'findByIdAndUpdate'], [Post, 'findByIdAndDelete'],
      [User, 'find'], [User, 'findByIdAndUpdate'], [User, 'findByIdAndDelete'],
    ]) t.mock.method(model, name, () => assert.fail('Unauthorized route reached a data operation'))

    for (const roleId of [ROLE.READER, ROLE.MODERATOR]) {
      current = { ...user, roleId }
      for (const [router, method, path] of [
        [postsRouter, 'post', '/'], [postsRouter, 'put', '/:id'], [postsRouter, 'delete', '/:id'],
        [usersRouter, 'get', '/'], [usersRouter, 'patch', '/:id/role'], [usersRouter, 'delete', '/:id'],
        [apiRouter, 'get', '/roles'],
      ]) await rejectsStatus(() => runRoute(router, method, path, request({
        cookies: session(), user: { id: userId, roleId: ROLE.ADMIN }, body: { title: post.title, content },
      })), 403)
    }
    await rejectsStatus(() => runRoute(usersRouter, 'get', '/', request()), 401)
  })

  await t.test('post creation uses the authenticated administrator and preserves section data', async (t) => {
    ready(t)
    mockUser(t, { ...user, roleId: ROLE.ADMIN })
    let saved
    t.mock.method(Post, 'create', async (value) => { saved = value; return { ...post, ...value } })
    const res = await runRoute(postsRouter, 'post', '/', request({
      cookies: session(), body: { title: '  Статья  ', imageUrl: post.imageUrl, content, author: otherUserId, publishedAt: '1999-01-01' },
    }))
    assert.equal(res.statusCode, 201)
    assert.equal(saved.author, userId)
    assert.equal(saved.title, 'Статья')
    assert.equal(Object.hasOwn(saved, 'publishedAt'), false)
    assert.deepEqual(res.body.data.content, content)
    assert.deepEqual(res.body.data.comments, [])
  })

  await t.test('post validation rejects malformed sections and unsafe image schemes before persistence', async (t) => {
    const create = t.mock.method(Post, 'create', () => assert.fail('Invalid post reached mongoose'))
    for (const body of [
      { title: '', content }, { title: post.title, content: 'plain string' },
      { title: post.title, content: { ...content, body: {} } },
      { title: post.title, content: { ...content, body: 'x'.repeat(100001) } },
      { title: post.title, content, imageUrl: 'javascript:alert(1)' },
      { title: post.title, content, imageUrl: '//untrusted.example/cover.svg' },
    ]) await rejectsStatus(() => posts.createPost(request({ body, user: { id: userId } }), response()), 400)
    assert.equal(create.mock.callCount(), 0)
  })

  await t.test('post update limits persisted fields and deletion removes dependent comments', async (t) => {
    mockPostDetails(t)
    const update = t.mock.method(Post, 'findByIdAndUpdate', () => query(post))
    const res = response()
    await posts.updatePost(request({ user: { id: userId }, body: { title: post.title, content, imageUrl: post.imageUrl, author: otherUserId } }), res)
    assert.equal(res.body.data.id, postId)
    const [id, patch, options] = update.mock.calls[0].arguments
    assert.equal(id, postId)
    assert.deepEqual(Object.keys(patch.$set).sort(), ['content', 'imageUrl', 'title'])
    assert.equal(options.runValidators, true)
    t.mock.method(Post, 'findByIdAndDelete', () => query(post))
    const removeComments = t.mock.method(Comment, 'deleteMany', async () => ({ deletedCount: 2 }))
    const deleted = response()
    await posts.deletePost(request(), deleted)
    assert.equal(deleted.body.data, true)
    assert.deepEqual(removeComments.mock.calls[0].arguments, [{ post: postId }])
  })

  await t.test('missing articles and invalid identifiers return clear 404/400 errors', async (t) => {
    const find = t.mock.method(Post, 'findById', () => query(null))
    await rejectsStatus(() => posts.getPost(request({ params: { id: '001' } }), response()), 400)
    assert.equal(find.mock.callCount(), 0)
    await rejectsStatus(() => posts.getPost(request(), response()), 404)
  })

  await t.test('post search escapes regex characters, paginates and returns comment counts', async (t) => {
    const pageQuery = query([post])
    const skip = t.mock.method(pageQuery, 'skip')
    const limit = t.mock.method(pageQuery, 'limit')
    const find = t.mock.method(Post, 'find', () => pageQuery)
    t.mock.method(Post, 'countDocuments', async () => 5)
    t.mock.method(Comment, 'aggregate', async () => [{ _id: postId, count: 3 }])
    const res = response()
    await posts.getPosts(request({ query: { search: 'a+b[0]', page: '2', limit: '2' } }), res)
    assert.deepEqual(find.mock.calls[0].arguments, [{ title: { $regex: 'a\\+b\\[0\\]', $options: 'i' } }])
    assert.deepEqual(skip.mock.calls[0].arguments, [2])
    assert.deepEqual(limit.mock.calls[0].arguments, [2])
    assert.equal(res.body.data.lastPage, 3)
    assert.equal(res.body.data.posts[0].commentsCount, 3)
    for (const query of [{ page: '0' }, { limit: '51' }, { search: { $ne: '' } }]) {
      await rejectsStatus(() => posts.getPosts(request({ query }), response()), 400)
    }
    assert.equal(find.mock.callCount(), 1)
  })

  await t.test('article comments map current author names and retain deleted authors', async (t) => {
    const comments = [
      { _id: commentId, post: postId, author: userId, content: 'Первый', publishedAt: post.publishedAt },
      { _id: otherUserId, post: postId, author: otherUserId, content: 'Второй', publishedAt: post.publishedAt },
    ]
    mockPostDetails(t, comments, [user])
    const res = response()
    await posts.getPost(request(), res)
    assert.equal(res.body.data.comments[0].author, user.login)
    assert.equal(res.body.data.comments[0].authorId, userId)
    assert.equal(res.body.data.comments[1].author, 'Удалённый пользователь')
    assert.equal(res.body.data.comments[1].authorId, otherUserId)
    assert.equal(res.body.data.comments[0].postId, postId)
  })

  await t.test('comment creation ignores a forged author and validates blank content', async (t) => {
    ready(t)
    mockUser(t)
    mockPostDetails(t)
    t.mock.method(Post, 'exists', async () => ({ _id: postId }))
    const create = t.mock.method(Comment, 'create', async () => ({}))
    const res = await runRoute(postsRouter, 'post', '/:id/comments', request({
      cookies: session(), body: { content: '  Комментарий  ', authorId: otherUserId, userId: otherUserId },
    }))
    assert.equal(res.statusCode, 201)
    assert.deepEqual(create.mock.calls[0].arguments, [{ post: postId, author: userId, content: 'Комментарий' }])
    await rejectsStatus(() => posts.createComment(request({ user: { id: userId }, body: { content: '   ' } }), response()), 400)
    assert.equal(create.mock.callCount(), 1)
  })

  await t.test('readers cannot delete even their own comments; moderators use a post-scoped delete', async (t) => {
    ready(t)
    let current = user
    t.mock.method(User, 'findById', () => query(current))
    mockPostDetails(t)
    let deletedCount = 1
    const remove = t.mock.method(Comment, 'deleteOne', async () => ({ deletedCount }))
    const req = request({ cookies: session(), body: { authorId: userId } })
    await rejectsStatus(() => runRoute(postsRouter, 'delete', '/:id/comments/:commentId', req), 403)
    assert.equal(remove.mock.callCount(), 0)
    current = { ...user, roleId: ROLE.MODERATOR }
    await runRoute(postsRouter, 'delete', '/:id/comments/:commentId', req)
    assert.deepEqual(remove.mock.calls[0].arguments, [{ _id: commentId, post: postId }])
    deletedCount = 0
    await rejectsStatus(() => runRoute(postsRouter, 'delete', '/:id/comments/:commentId', req), 404)
  })

  await t.test('administrator user management returns safe DTOs and validates role assignments', async (t) => {
    ready(t)
    mockUser(t, { ...user, roleId: ROLE.ADMIN })
    t.mock.method(User, 'find', () => query([{ ...user, passwordHash }]))
    const list = await runRoute(usersRouter, 'get', '/', request({ cookies: session() }))
    assert.equal(list.body.data[0].login, user.login)
    assert.equal(Object.hasOwn(list.body.data[0], 'passwordHash'), false)
    const update = t.mock.method(User, 'findByIdAndUpdate', () => query({ ...user, roleId: ROLE.MODERATOR }))
    const changed = await runRoute(usersRouter, 'patch', '/:id/role', request({
      cookies: session(), params: { id: otherUserId }, body: { roleId: ROLE.MODERATOR, login: 'injected' },
    }))
    assert.equal(changed.body.data.roleId, ROLE.MODERATOR)
    assert.deepEqual(update.mock.calls[0].arguments[1], { $set: { roleId: ROLE.MODERATOR } })
    for (const roleId of [ROLE.GUEST, -1, '0', { $ne: null }]) {
      await rejectsStatus(() => users.patchUserRole(request({ params: { id: otherUserId }, body: { roleId } }), response()), 400)
    }
    assert.equal(update.mock.callCount(), 1)
    t.mock.method(User, 'findByIdAndDelete', () => query(user))
    const removed = await runRoute(usersRouter, 'delete', '/:id', request({ cookies: session(), params: { id: otherUserId } }))
    assert.equal(removed.body.data, true)
    const roles = await runRoute(apiRouter, 'get', '/roles', request({ cookies: session() }))
    assert.ok(roles.body.data.some(({ id }) => id === ROLE.ADMIN))
  })

  await t.test('PUBLIC_ORIGIN supports a TLS proxy and rejects cross-site mutations', async (t) => {
    const original = process.env.PUBLIC_ORIGIN
    t.after(() => {
      if (original === undefined) delete process.env.PUBLIC_ORIGIN
      else process.env.PUBLIC_ORIGIN = original
    })
    process.env.PUBLIC_ORIGIN = 'https://blog.example'
    const allowed = await runHandlers([sameOrigin, auth.logout], request({ method: 'POST', headers: { host: 'internal:5173', origin: 'https://blog.example' } }), response())
    assert.equal(allowed.body.error, null)
    for (const headers of [
      { host: 'internal:5173', origin: 'http://internal:5173', 'x-forwarded-proto': 'https' },
      { host: 'internal:5173', origin: 'https://blog.example', 'sec-fetch-site': 'cross-site' },
    ]) await rejectsStatus(() => runHandlers([sameOrigin], request({ method: 'POST', headers }), response()), 403)
    for (const invalid of ['https://blog.example/path', 'https://user:password@blog.example', 'https://blog.example?x=1', 'ftp://blog.example']) {
      process.env.PUBLIC_ORIGIN = invalid
      assert.throws(initializeOrigin, /PUBLIC_ORIGIN/)
    }
  })

  await t.test('API error responses use correct statuses and conceal internal database details', (t) => {
    const log = t.mock.method(console, 'error', () => {})
    for (const [error, status] of [
      [Object.assign(new Error('Parser internals'), { type: 'entity.parse.failed' }), 400],
      [Object.assign(new Error('Payload internals'), { type: 'entity.too.large' }), 413],
      [Object.assign(new Error('mongodb://secret-host/private'), { name: 'MongoNetworkError' }), 503],
      [Object.assign(new Error('Private unique index detail'), { code: 11000 }), 409],
      [new Error('mongodb://secret-host/private'), 500],
    ]) {
      const res = response()
      errorHandler(error, { path: '/api/posts' }, res, () => assert.fail('Unexpected error forwarding'))
      assert.equal(res.statusCode, status)
      assert.equal(res.body.data, null)
      assert.equal(typeof res.body.error, 'string')
      assert.equal(JSON.stringify(res.body).includes(error.message), false)
    }
    assert.equal(log.mock.callCount(), 1)
    assert.equal(JSON.stringify(log.mock.calls[0].arguments).includes('secret-host'), false)
    const original = new Error('Already sent')
    let forwarded
    errorHandler(original, { path: '/api/posts' }, { headersSent: true }, (error) => { forwarded = error })
    assert.equal(forwarded, original)
  })
})
