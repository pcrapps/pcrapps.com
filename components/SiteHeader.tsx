export function SiteHeader() {
  return (
    <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
      <div className="container mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
        <a href="/" className="font-medium">patrickcrapps.com</a>
        <nav className="flex gap-4 text-sm">
          <a className="hover:underline" href="/writing">Writing</a>
          <a className="hover:underline" href="/projects">Projects</a>
          <a className="hover:underline" href="/about">About</a>
          <a className="hover:underline" href="/now">Now</a>
          <a className="hover:underline" href="/uses">Uses</a>
          <a className="hover:underline" href="/contact">Contact</a>
          <a className="hover:underline" href="/resume">Resume</a>
        </nav>
      </div>
    </header>
  )
}

