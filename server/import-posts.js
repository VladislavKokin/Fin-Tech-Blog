import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { loadEnvironment } from './config/env.js'
import { connectDatabase, disconnectDatabase } from './config/database.js'
import { ROLE } from '../shared/constants/index.js'
import { User } from './models/User.js'
import { Post } from './models/Post.js'
import { HttpError } from './helpers/http-error.js'
import { LOGIN_PATTERN, validatePost } from './helpers/validation.js'

// Legacy dates have no timezone. Interpret them consistently as UTC, matching
// the server DTO formatter; reject overflow dates instead of normalizing them.
export function parseLegacyDate(value) {
  if (typeof value !== 'string') throw new HttpError(400, 'Некорректная дата публикации.')
  const match = value.match(/^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2})(?::(\d{2}))?)?$/)
  if (!match) throw new HttpError(400, 'Ожидается дата YYYY-MM-DD или YYYY-MM-DD HH:mm[:ss].')
  const timestamp = `${match[1]}T${match[2] || '00:00'}:${match[3] || '00'}`
  const date = new Date(`${timestamp}.000Z`)
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 19) !== timestamp) {
    throw new HttpError(400, 'Некорректная дата публикации.')
  }
  return date
}

export function prepareLegacyPosts(posts) {
  if (!Array.isArray(posts)) throw new HttpError(400, 'В data/posts.json отсутствует массив posts.')
  const identities = new Set()
  return posts.map((post, index) => {
    try {
      const values = validatePost({ title: post?.title, imageUrl: post?.image_url, content: post?.content })
      const sourceId = post?.id
      if (sourceId !== undefined && sourceId !== null && !['string', 'number'].includes(typeof sourceId)) {
        throw new HttpError(400, 'Исходный ID статьи должен быть строкой или числом.')
      }
      const legacyId = sourceId === undefined || sourceId === null || sourceId === ''
        ? `json-server:index:${index}` : `json-server:${String(sourceId)}`
      if (identities.has(legacyId)) throw new HttpError(400, 'В data/posts.json повторяются исходные ID статей.')
      identities.add(legacyId)
      return { ...values, legacyId, publishedAt: parseLegacyDate(post?.published_at) }
    } catch (error) {
      if (error.status) throw new HttpError(error.status, `Статья №${index + 1}: ${error.message}`)
      throw error
    }
  })
}

export async function importLegacyPosts(posts, authorId) {
  const counts = { imported: 0, skipped: 0 }
  for (const post of posts) {
    const existing = await Post.findOne({ legacyId: post.legacyId }).select('_id').lean()
    if (existing) {
      counts.skipped += 1
      continue
    }
    try {
      await Post.create({ ...post, author: authorId })
      counts.imported += 1
    } catch (error) {
      // Concurrent explicit imports can encounter the migration unique index.
      if (error.code === 11000 && error.keyPattern?.legacyId) counts.skipped += 1
      else throw error
    }
  }
  return counts
}

async function main() {
  try {
    loadEnvironment()
    const login = process.argv[2]
    if (!login || !LOGIN_PATTERN.test(login) || process.argv.length !== 3) {
      throw new HttpError(400, 'Использование: npm run import-posts -- <логин существующего администратора>.')
    }

    // Only the articles are read from the legacy fixture. Plaintext users,
    // sessions and comments are never imported into the new database.
    const fixture = JSON.parse(await readFile(new URL('../data/posts.json', import.meta.url), 'utf8'))
    const posts = prepareLegacyPosts(fixture.posts)
    if (!await connectDatabase(process.env.MONGODB_URI)) {
      throw new HttpError(400, 'Сначала задайте MONGODB_URI в корневом .env.')
    }
    const admin = await User.findOne({ login }).select('login roleId').lean()
    if (!admin || admin.roleId !== ROLE.ADMIN) {
      throw new HttpError(403, 'Указанный логин должен принадлежать существующему администратору. Сначала выполните npm run create-admin.')
    }

    // Ensure the sparse migration index exists before writes start.
    await Post.init()
    const counts = await importLegacyPosts(posts, admin._id)
    console.info(`Импорт завершён. Добавлено статей: ${counts.imported}; пропущено существующих: ${counts.skipped}.`)
    console.info('Пользователи, сессии и комментарии из data/posts.json не импортировались.')
  } catch (error) {
    const message = error.status ? error.message
      : error.code === 'ENOENT' ? 'Исходный файл data/posts.json не найден.'
        : error instanceof SyntaxError ? 'В data/posts.json некорректный JSON.'
          : 'Не удалось импортировать статьи. Проверьте подключение MongoDB и исходный data/posts.json. Уже добавленные статьи будут пропущены при повторном запуске.'
    console.error(message)
    process.exitCode = 1
  } finally {
    try {
      await disconnectDatabase()
    } catch {
      console.error('Не удалось закрыть подключение MongoDB.')
      process.exitCode = 1
    }
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  await main()
}
