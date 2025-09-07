export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/70 py-8 text-sm text-slate-500 dark:border-slate-800">
      <div className="container mx-auto max-w-3xl px-4">
        <p>
          © {new Date().getFullYear()} Patrick Crapps. Built with Next.js. Placeholder footer.
        </p>
      </div>
    </footer>
  )
}

