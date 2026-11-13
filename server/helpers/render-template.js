export function serializeState(state) {
  return JSON.stringify(state)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

export function renderTemplate(template, { html, state }, styles = '') {
  return template
    .replace('<!--app-html-->', () => html)
    .replace('<!--app-state-->', () => (
      `<script id="preloaded-state" type="application/json">${serializeState(state)}</script>`
    ))
    .replace('</head>', () => `${styles}</head>`)
}
