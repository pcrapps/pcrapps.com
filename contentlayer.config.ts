import { defineDocumentType, makeSource } from 'contentlayer/source-files'

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `writing/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    updated: { type: 'date', required: false },
    summary: { type: 'string', required: true },
    tags: { type: 'list', of: { type: 'string' } },
    slug: { type: 'string', required: false },
    canonical: { type: 'string', required: false },
    cover: { type: 'string', required: false },
    status: { type: 'string', required: false },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (doc) => `/writing/${doc._raw.flattenedPath}`,
    },
  },
}))

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Post],
})

