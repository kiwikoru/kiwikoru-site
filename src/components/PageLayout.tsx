import type { ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import KiwiKoruPet from './KiwiKoruPet'
import { useLocation } from 'react-router-dom'

interface PageLayoutProps {
  children: ReactNode
}

export default function PageLayout({ children }: PageLayoutProps) {
  const isWorkingSmarter = useLocation().pathname === '/working-smarter-consulting'

  return (
    <div className="min-h-screen flex flex-col">
      {!isWorkingSmarter && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isWorkingSmarter && <Footer />}
      {!isWorkingSmarter && <KiwiKoruPet />}
    </div>
  )
}
