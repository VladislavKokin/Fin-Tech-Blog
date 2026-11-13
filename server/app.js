import { readFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import express from 'express'
import cookieParser from 'cookie-parser'
import { isDatabaseReady } from './config/database.js'
import { apiRouter } from './routes/index.js'
import { createPagesRouter } from './routes/pages.js'
import { errorHandler } from './middlewares/error-handler.js'
import { weather } from './routes/weather.js'

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))

export async function createApp({
  mode = process.env.NODE_ENV === 'production' ? 'production' : 'development',
  root = projectRoot,
} = {}) {
  const app = express()
  let vite
  let template
  let render
  app.disable('x-powered-by')
  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff')
    next()
  })
  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())
  app.get('/api/health', (req, res) => {
    res.set('Cache-Control', 'no-store').json({
      error: null,
      data: { server: 'ok', database: isDatabaseReady() ? 'connected' : 'disconnected' },
    })
  })
  app.get('/api/weather', weather)
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  }, apiRouter)

  if (mode === 'development') {
    const { createServer } = await import('vite')
    vite = await createServer({
      root,
      // Avoid temporary config modules triggering Node's watch mode in a loop.
      configLoader: 'runner',
      server: {
        middlewareMode: true,
        fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/data/**', '**/server/**', '**/server.js'] },
      },
      appType: 'custom',
    })
    app.use(vite.middlewares)
  } else {
    template = await readFile(join(root, 'dist/client/index.html'), 'utf8')
    ;({ render } = await import(pathToFileURL(join(root, 'dist/server/entry-server.js')).href))
    app.use('/assets', express.static(join(root, 'dist/client/assets'), {
      immutable: true, maxAge: '1y', index: false,
    }))
    app.use(express.static(join(root, 'dist/client'), { index: false, maxAge: '1h' }))
  }
  app.use(createPagesRouter({ root, vite, render, template }))
  app.use(errorHandler)
  return { app, close: async () => { await vite?.close() } }
}
