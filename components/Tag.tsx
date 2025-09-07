export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-slate-200 px-2 py-0.5 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-200">
      {children}
    </span>
  )
}

