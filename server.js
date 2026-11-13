import { loadEnvironment } from './server/config/env.js'

loadEnvironment()
if (process.argv.includes('--production')) process.env.NODE_ENV = 'production'

const [{ createApp }, { connectDatabase, disconnectDatabase }, { initializeAuth }, { initializeOrigin }] = await Promise.all([
  import('./server/app.js'),
  import('./server/config/database.js'),
  import('./server/helpers/token.js'),
  import('./server/middlewares/same-origin.js'),
])

const port = Number(process.env.PORT || 5173)
const host = process.env.HOST || '127.0.0.1'
let runtime
let httpServer
try {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Некорректный PORT')
  initializeAuth()
  initializeOrigin()
  const connected = await connectDatabase(process.env.MONGODB_URI)
  if (!connected) console.info('MongoDB не настроена. Добавьте MONGODB_URI в корневой .env; публичный SSR доступен.')
  runtime = await createApp()
  httpServer = runtime.app.listen(port, host, () => console.info(`Blog SSR: http://${host}:${port}`))
  httpServer.on('error', async (error) => {
    console.error('Ошибка HTTP-сервера:', error.code || error.name)
    await runtime.close()
    await disconnectDatabase()
    process.exitCode = 1
  })
} catch (error) {
  console.error('Не удалось запустить Blog:', error.code || error.name)
  console.error('Проверьте .env и сборку. Production требует JWT_SECRET от 32 символов.')
  await runtime?.close()
  await disconnectDatabase()
  process.exitCode = 1
}

let shuttingDown = false
async function shutdown() {
  if (shuttingDown) return
  shuttingDown = true
  const timeout = setTimeout(() => process.exit(1), 10000)
  timeout.unref()
  if (httpServer) await new Promise((resolve) => httpServer.close(resolve))
  await runtime?.close()
  await disconnectDatabase()
  clearTimeout(timeout)
}
process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)
