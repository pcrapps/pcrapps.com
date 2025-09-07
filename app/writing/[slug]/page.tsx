export default function PostPage({ params }: { params: { slug: string } }) {
  return (
    <article>
      <h1 className="text-2xl font-semibold">Post: {params.slug}</h1>
      <p className="mt-3">MDX content will render here.</p>
    </article>
  )
}

