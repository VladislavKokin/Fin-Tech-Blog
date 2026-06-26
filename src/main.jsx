
import { createRoot } from 'react-dom/client'
import { BrowserRouter} from 'react-router-dom'
import { MainPage } from './components/MainPage/MainPage'
import { Pages } from './components/Pages/Pages'
import './index.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <MainPage />
    <Pages/>
  </BrowserRouter>,
)
