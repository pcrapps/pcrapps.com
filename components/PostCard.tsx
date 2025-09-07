export function PostCard({ title, summary, href }: { title: string; summary: string; href: string }) {
  return (
    <a href={href} className="block rounded-lg border p-4 transition hover:shadow-sm dark:border-slate-800">
      <h3 className="font-medium">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{summary}</p>
    </a>
  )
}

