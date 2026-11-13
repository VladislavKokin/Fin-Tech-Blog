import { hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { makeStore } from './store/store'
import { App } from './App'

const stateElement = document.getElementById('preloaded-state')
const state = stateElement ? JSON.parse(stateElement.textContent) : undefined
const store = makeStore(state)

hydrateRoot(document.getElementById('root'), (
  <BrowserRouter>
    <Provider store={store}><App /></Provider>
  </BrowserRouter>
))
