import mongoose from 'mongoose'
import { HttpError } from './http-error.js'
import { ROLE } from '../../shared/constants/index.js'

export const LOGIN_PATTERN = /^\w{3,15}$/
export const PASSWORD_PATTERN = /^(?=.*?[A-Z])(?=.*?\d)(?=.*?[-#$%!@&*?])[A-Za-z\d\-#$%!@&*?]{8,20}$/

export function validateCredentials(body) {
  const { login, password } = body ?? {}
  if (typeof login !== 'string' || !LOGIN_PATTERN.test(login)) {
    throw new HttpError(400, 'Логин должен содержать от 3 до 15 латинских букв, цифр или символов подчёркивания.')
  }
  if (typeof password !== 'string' || !PASSWORD_PATTERN.test(password)) {
    throw new HttpError(400, 'Пароль должен содержать от 8 до 20 символов, заглавную букву, цифру и специальный символ.')
  }
  return { login, password }
}

export function validateId(id, label = 'ID') {
  if (!mongoose.isObjectIdOrHexString(id)) throw new HttpError(400, `Некорректный ${label}.`)
  return id
}

export function validateRole(roleId) {
  if (![ROLE.ADMIN, ROLE.MODERATOR, ROLE.READER].includes(roleId)) {
    throw new HttpError(400, 'Некорректная роль пользователя.')
  }
  return roleId
}

export function validatePagination(value, fallback, maximum) {
  if (value === undefined) return fallback
  const number = typeof value === 'string' && /^[1-9]\d*$/.test(value) ? Number(value) : value
  if (!Number.isSafeInteger(number) || number < 1 || number > maximum) {
    throw new HttpError(400, 'Некорректные параметры пагинации.')
  }
  return number
}

export function validatePost(body) {
  const { title, imageUrl = '', content } = body ?? {}
  if (typeof title !== 'string' || !title.trim() || title.length > 250) {
    throw new HttpError(400, 'Укажите заголовок статьи длиной до 250 символов.')
  }
  if (typeof imageUrl !== 'string' || imageUrl.length > 2048) {
    throw new HttpError(400, 'Некорректный адрес изображения.')
  }
  if (imageUrl && !/^(?:https?:\/\/|\/(?!\/))/i.test(imageUrl)) {
    throw new HttpError(400, 'Адрес изображения должен начинаться с http://, https:// или /.')
  }
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    throw new HttpError(400, 'Укажите содержимое статьи.')
  }
  const sections = {}
  for (const section of ['introduction', 'body', 'conclusion']) {
    if (typeof content[section] !== 'string' || content[section].length > 100000) {
      throw new HttpError(400, 'Разделы статьи должны содержать текст длиной до 100000 символов.')
    }
    sections[section] = content[section]
  }
  return { title: title.trim(), imageUrl: imageUrl.trim(), content: sections }
}

export function validateComment(content) {
  if (typeof content !== 'string' || !content.trim() || content.length > 5000) {
    throw new HttpError(400, 'Комментарий должен содержать от 1 до 5000 символов.')
  }
  return content.trim()
}
