import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { loadEnvironment } from './config/env.js'
import { connectDatabase, disconnectDatabase } from './config/database.js'
import { createAdmin } from './services/index.js'

loadEnvironment()
const prompt = createInterface({ input: stdin, output: stdout })
try {
  if (!await connectDatabase(process.env.MONGODB_URI)) throw new Error('Сначала задайте MONGODB_URI в .env.')
  const login = await prompt.question('Логин администратора (3–15 букв, цифр или _): ')
  const password = await prompt.question('Пароль (ввод виден, в историю shell не записывается): ')
  const user = await createAdmin(login, password)
  console.info(`Администратор ${user.login} создан.`)
} catch (error) {
  console.error(error.status ? error.message : 'Не удалось создать администратора. Проверьте MongoDB и данные.')
  process.exitCode = 1
} finally {
  prompt.close()
  await disconnectDatabase()
}
