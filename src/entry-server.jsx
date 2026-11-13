import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { makeStore } from './store/store'
import { App } from './App'

export function render(url, preloadedState) {
  const store = makeStore(preloadedState)
  const html = renderToString(
    <StaticRouter location={url}>
      <Provider store={store}><App /></Provider>
    </StaticRouter>,
  )
  return { html, state: store.getState() }
}
