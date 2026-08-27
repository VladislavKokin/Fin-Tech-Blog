import { useLayoutEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Provider, useDispatch } from 'react-redux'
import { store } from './store/store'
import { setUser } from './store/action'
import { Header } from './components/Header/header'
import { MainPage } from './components/MainPage/MainPage'
import { Post } from './components/Post/Post'
import { Users } from "./components/Users/Users";
import { Footer } from './components/Footer/Footer'
import { AnimatePresence, motion } from 'framer-motion'
import './index.css'

function PageWrapper({ children }) {
  return (
    <motion.div
      className="page-transition"
      initial={{ opacity: 0, x: 120, filter: 'blur(6px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: -120, filter: 'blur(4px)' }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
    >
      <motion.div
        className="page-dim"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      />
      {children}
    </motion.div>
  )
}

export const App = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    const currentUserDataJSON = sessionStorage.getItem('userData')

    if (!currentUserDataJSON) {
      return;
    }

    const currentUserData = JSON.parse(currentUserDataJSON)

    dispatch(setUser({
      ...currentUserData,
      roleId: Number(currentUserData.roleId),
    }))
  }, [dispatch]);

  return (
    <>
      <Header />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
              <PageWrapper>
                <MainPage />
              </PageWrapper>
            }
          />
          <Route path="/post" element={
              <PageWrapper>
                <Post />
              </PageWrapper>
            }
          />
          <Route path="/post/:id" element={
              <PageWrapper>
                <Post />
              </PageWrapper>
            }
          />
          <Route path="/users" element={
              <PageWrapper>
                <Users />
              </PageWrapper>
            }
          />
        </Routes>
      </AnimatePresence>
      <Footer />
    </>
  )
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>
)

//npx json-server --watch src/db.json --port 3005