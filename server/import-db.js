import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import bcrypt from 'bcryptjs'
import { ROLES } from '../shared/constants/index.js'
import { loadEnvironment } from './config/env.js'
import { connectDatabase, disconnectDatabase } from './config/database.js'
import { User } from './models/User.js'
import { Post } from './models/Post.js'
import { Comment } from './models/Comment.js'
import { Role } from './models/Role.js'
import { HttpError } from './helpers/http-error.js'
import { validateComment, validateCredentials, validatePost, validateRole } from './helpers/validation.js'
import { parseLegacyDate } from './import-posts.js'

const invalidSource = (message) => new HttpError(400, message)

function sourceId(value) {
  const isString = typeof value === 'string' && value.trim().length > 0
  const isNumber = typeof value === 'number' && Number.isSafeInteger(value)
  if (!isString && !isNumber) throw invalidSource('Исходный ID должен быть непустой строкой или целым числом.')
  return String(value)
}

function sourceRows(data, collection) {
  if (!Array.isArray(data[collection])) throw invalidSource(`В исходном JSON отсутствует массив ${collection}.`)
  const ids = new Set()
  return data[collection].map((row, index) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      throw invalidSource(`${collection}, запись №${index + 1}: ожидается объект.`)
    }
    const id = sourceId(row.id)
    if (ids.has(id)) throw invalidSource(`В исходной коллекции ${collection} повторяются ID.`)
    ids.add(id)
    return { row, sourceId: id, legacyId: `json-server:${id}` }
  })
}

function prepareRows(rows, collection, prepare) {
  return rows.map((entry, index) => {
    try {
      return prepare(entry)
    } catch (error) {
      if (error.status) throw invalidSource(`${collection}, запись №${index + 1}: ${error.message}`)
      throw error
    }
  })
}



export function prepareLegacyDatabase(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw invalidSource('Исходный JSON должен содержать объект базы данных.')
  const roleRows = sourceRows(data, 'roles')
  const userRows = sourceRows(data, 'users')
  const postRows = sourceRows(data, 'posts')
  const commentRows = sourceRows(data, 'comments')
  if (data.sessions !== undefined && !Array.isArray(data.sessions)) throw invalidSource('Поле sessions должно быть массивом.')

  const roles = prepareRows(roleRows, 'roles', ({ row, sourceId: id }) => {
    if (!/^[0-3]$/.test(id)) throw invalidSource('Неверный ID роли; допускаются 0, 1, 2 и 3.')
    const numericId = Number(id)
    const canonical = ROLES.find((role) => role.id === numericId)
    if (row.name !== canonical.name) throw invalidSource('Название роли не соответствует её ID в приложении.')
    return { _id: numericId, name: row.name }
  })
  if (roles.length !== ROLES.length) throw invalidSource('Исходный справочник должен содержать все четыре роли 0–3.')

  const logins = new Set()
  const users = prepareRows(userRows, 'users', ({ row, sourceId: id, legacyId }) => {
    const { login, password } = validateCredentials(row)
    if (logins.has(login)) throw invalidSource('В исходной базе повторяются логины.')
    logins.add(login)
    const roleId = typeof row.role_id === 'string' && /^[0-2]$/.test(row.role_id) ? Number(row.role_id) : row.role_id
    validateRole(roleId)
    return { sourceId: id, legacyId, login, password, roleId, registeredAt: parseLegacyDate(row.registed_at) }
  })
  const userIds = new Set(users.map((user) => user.sourceId))

  const posts = prepareRows(postRows, 'posts', ({ row, sourceId: id, legacyId }) => {
    const values = validatePost({ title: row.title, imageUrl: row.image_url, content: row.content })
    const authorSourceId = row.author_id !== undefined && row.author_id !== null && row.author_id !== ''
      ? sourceId(row.author_id) : null
    if (authorSourceId && !userIds.has(authorSourceId)) throw invalidSource('Автор статьи отсутствует в исходной базе.')
    if (row.annotation !== undefined && (typeof row.annotation !== 'string' || row.annotation.length > 10000)) {
      throw invalidSource('Аннотация должна быть строкой длиной до 10000 символов.')
    }
    return {
      ...values, sourceId: id, legacyId, authorSourceId,
      publishedAt: parseLegacyDate(row.published_at),
      ...(row.annotation === undefined ? {} : { annotation: row.annotation }),
    }
  })
  const postIds = new Set(posts.map((post) => post.sourceId))
  const comments = prepareRows(commentRows, 'comments', ({ row, sourceId: id, legacyId }) => {
    const authorSourceId = sourceId(row.author_id)
    const postSourceId = sourceId(row.post_id)
    if (!userIds.has(authorSourceId)) throw invalidSource('Автор комментария отсутствует в исходной базе.')
    if (!postIds.has(postSourceId)) throw invalidSource('Статья комментария отсутствует в исходной базе.')
    return {
      sourceId: id, legacyId, authorSourceId, postSourceId,
      content: validateComment(row.content), publishedAt: parseLegacyDate(row.published_at),
    }
  })

  return { roles, users, posts, comments, sessionsSkipped: data.sessions?.length || 0 }
}

async function insertOrReuse(find, create, counts) {
  const existing = await find()
  if (existing) {
    counts.skipped += 1
    return existing
  }
  try {
    const created = await create()
    counts.created += 1
    return created
  } catch (error) {
    if (error.code !== 11000) throw error

    const concurrent = await find()
    if (!concurrent) throw error
    counts.skipped += 1
    return concurrent
  }
}

export async function importLegacyDatabase(data) {
  const prepared = prepareLegacyDatabase(data)
  await Promise.all([Role.init(), User.init(), Post.init(), Comment.init()])

  const counts = {
    roles: { created: 0, skipped: 0 }, users: { created: 0, skipped: 0 },
    posts: { created: 0, skipped: 0 }, comments: { created: 0, skipped: 0 },
    sessionsSkipped: prepared.sessionsSkipped,
  }
  const userIds = new Map()
  const postIds = new Map()

  for (const role of prepared.roles) {
    await insertOrReuse(() => Role.findById(role._id).lean(), () => Role.create(role), counts.roles)
  }
  for (const user of prepared.users) {
    const find = async () => await User.findOne({ legacyId: user.legacyId }).select('_id').lean()
      || await User.findOne({ login: user.login }).select('_id').lean()
    const saved = await insertOrReuse(find, async () => User.create({
      login: user.login, roleId: user.roleId, registeredAt: user.registeredAt, legacyId: user.legacyId,
      passwordHash: await bcrypt.hash(user.password, 12),
    }), counts.users)
    userIds.set(user.sourceId, saved._id)
  }
  for (const post of prepared.posts) {
    const { sourceId: id, authorSourceId, ...values } = post
    const saved = await insertOrReuse(
      () => Post.findOne({ legacyId: post.legacyId }).select('_id').lean(),
      () => Post.create({ ...values, ...(authorSourceId ? { author: userIds.get(authorSourceId) } : {}) }), counts.posts,
    )
    postIds.set(id, saved._id)
  }
  for (const comment of prepared.comments) {
    const { authorSourceId, postSourceId, legacyId, content, publishedAt } = comment
    await insertOrReuse(
      () => Comment.findOne({ legacyId }).select('_id').lean(),
      () => Comment.create({ legacyId, content, publishedAt, author: userIds.get(authorSourceId), post: postIds.get(postSourceId) }),
      counts.comments,
    )
  }
  return counts
}

function printCounts(counts, checked = false) {
  console.info(checked ? 'Исходный JSON проверен. Подключение к базе и запись не выполнялись.' : 'Импорт завершён.')
  for (const collection of ['users', 'posts', 'comments', 'roles']) {
    const result = counts[collection]
    console.info(checked ? `${collection}: ${result}` : `${collection}: добавлено ${result.created}, пропущено ${result.skipped}.`)
  }
  console.info(`Старых сессий исключено: ${counts.sessionsSkipped}.`)
}

async function main() {
  let attemptedConnection = false
  try {
    const args = process.argv.slice(2)
    const checked = args.includes('--check')
    const paths = args.filter((argument) => argument !== '--check')
    if (paths.length !== 1 || paths[0].startsWith('--')) {
      throw invalidSource('Использование: npm run import-db -- [--check] /путь/к/db.json')
    }
    const data = JSON.parse(await readFile(resolve(paths[0]), 'utf8'))
    const prepared = prepareLegacyDatabase(data)
    if (checked) {
      printCounts({
        users: prepared.users.length, posts: prepared.posts.length,
        comments: prepared.comments.length, roles: prepared.roles.length, sessionsSkipped: prepared.sessionsSkipped,
      }, true)
      return
    }

    loadEnvironment()
    attemptedConnection = true
    if (!await connectDatabase(process.env.MONGODB_URI)) throw invalidSource('Сначала задайте MONGODB_URI в корневом .env.')
    printCounts(await importLegacyDatabase(data))
  } catch (error) {
    const message = error.status ? error.message
      : error.code === 'ENOENT' ? 'Исходный JSON файл не найден.'
        : error instanceof SyntaxError ? 'Исходный файл содержит некорректный JSON.'
          : 'Не удалось импортировать базу. Проверьте подключение MongoDB и исходные данные. Повторный запуск пропустит уже перенесённые записи.'
    console.error(message)
    process.exitCode = 1
  } finally {
    if (attemptedConnection) {
      try {
        await disconnectDatabase()
      } catch {
        console.error('Не удалось закрыть подключение MongoDB.')
        process.exitCode = 1
      }
    }
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  await main()
}
