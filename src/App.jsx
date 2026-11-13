import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import PropTypes from 'prop-types'
import { ERROR } from '../shared/constants/index.js'
import { Header } from './components/header/header'
import { MainPage } from './components/main-page/main-page'
import { Posts } from './components/posts/posts'
import { Post } from './components/post/post'
import { Users } from './components/users/users'
import { Error } from './components/error/error'
import { Footer } from './components/footer/footer'
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

PageWrapper.propTypes = { children: PropTypes.node.isRequired }

export const App = () => {
  const location = useLocation()
  return (
    <>
      <Header />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><MainPage /></PageWrapper>} />
          <Route path="/posts" element={<PageWrapper><Posts /></PageWrapper>} />
          <Route path="/post" element={<PageWrapper><Post /></PageWrapper>} />
          <Route path="/post/:id" element={<PageWrapper><Post /></PageWrapper>} />
          <Route path="/post/:id/edit" element={<PageWrapper><Post /></PageWrapper>} />
          <Route path="/users" element={<PageWrapper><Users /></PageWrapper>} />
          <Route path="*" element={<PageWrapper><Error error={ERROR.PAGE_NOT_EXIST} /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </>
  )
}
