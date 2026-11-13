import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { Router } from 'express'
import { getCurrentUser } from '../helpers/current-user.js'
import { renderTemplate } from '../helpers/render-template.js'
import { loadPage } from '../load-page.js'

function escapeAttribute(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

async function collectStyles(vite) {
  const seen = new Set()
  const urls = new Set()
  const walk = (module) => {
    if (!module || seen.has(module)) return
    seen.add(module)
    if (/\.css(?:\?|$)/.test(module.url)) urls.add(module.url)
    module.importedModules.forEach(walk)
  }
  walk(await vite.environments.ssr.moduleGraph.getModuleByUrl('/src/entry-server.jsx'))
  return [...urls].map((url) => `<link rel="stylesheet" href="${escapeAttribute(url)}">`).join('')
}

export function createPagesRouter({ root, vite, render, template }) {
  const router = Router()
  router.get(/.*/, async (req, res, next) => {
    if (/\.[a-z0-9]+$/i.test(req.path) || /^\/(?:assets|src|@vite|@id|@fs)(?:\/|$)/.test(req.path)) {
      return res.status(404).type('text').send('Файл не найден')
    }
    try {
      const url = req.originalUrl
      let pageTemplate = template
      let renderPage = render
      let styles = ''
      if (vite) {
        pageTemplate = await vite.transformIndexHtml(url, await readFile(join(root, 'index.html'), 'utf8'))
        ;({ render: renderPage } = await vite.ssrLoadModule('/src/entry-server.jsx'))
        styles = await collectStyles(vite)
      }
      const user = await getCurrentUser(req)
      const { state, status } = await loadPage(url, user)
      const result = await renderPage(url, state)
      res.status(status).set('Cache-Control', 'private, no-store').type('html')
        .send(renderTemplate(pageTemplate, result, styles))
    } catch (error) {
      vite?.ssrFixStacktrace(error)
      next(error)
    }
  })
  return router
}
