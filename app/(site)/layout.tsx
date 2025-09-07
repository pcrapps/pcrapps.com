import '../styles/globals.css'
import { SiteHeader } from '../../components/SiteHeader'
import { SiteFooter } from '../../components/SiteFooter'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 rounded bg-black px-3 py-2 text-white">Skip to content</a>
      <SiteHeader />
      <main id="content" className="container mx-auto max-w-3xl flex-1 px-4 py-8 sm:py-12">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}

