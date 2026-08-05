import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import PageLayout from './components/PageLayout'
import Home from './pages/Home'
import Services from './pages/Services'
import Materials from './pages/Materials'
import Contact from './pages/Contact'
import Quote from './pages/Quote'
import YoushieMe from './pages/YoushieMe'
import YoushieOrder from './pages/YoushieOrder'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const { pathname } = useLocation()

  if (pathname === '/youshie-me' || pathname === '/youshieme') {
    return <YoushieMe />
  }
  if (pathname === '/youshie-order') {
    return <YoushieOrder />
  }

  return (
    <>
      <ScrollToTop />
      <PageLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/quote" element={<Quote />} />
        </Routes>
      </PageLayout>
    </>
  )
}
