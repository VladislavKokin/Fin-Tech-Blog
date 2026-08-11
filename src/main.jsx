
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { MainPage } from './components/MainPage/MainPage'
import { Pages } from './components/Pages/Pages'
import { Users } from "./components/Users/Users";
import { Footer } from './components/Footer/Footer'
import './index.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/pages" element={<Pages />} />
        <Route path="/users" element={<Users />} />
      </Routes>
      <Footer />
    </Provider>
  </BrowserRouter>,
)

//npx json-server --watch src/db.json --port 3005
