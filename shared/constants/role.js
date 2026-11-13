export const ROLE = Object.freeze({ ADMIN: 0, MODERATOR: 1, READER: 2, GUEST: 3 })

export const ROLES = Object.freeze([
  Object.freeze({ id: ROLE.ADMIN, name: 'Администратор' }),
  Object.freeze({ id: ROLE.MODERATOR, name: 'Модератор' }),
  Object.freeze({ id: ROLE.READER, name: 'Читатель' }),
  Object.freeze({ id: ROLE.GUEST, name: 'Гость' }),
])
