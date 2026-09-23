/**
 * Payload CMS Posts Collection
 * Complete field definitions, slug auto-generation hook, and access control
 */

export const PostsCollection = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'publishedAt', 'views'],
    group: 'Content',
  },
  access: {
    read: ({ req: { user } }: any) => {
      // Admins and editors can read all (including drafts)
      if (user?.role === 'admin' || user?.role === 'editor') return true;
      // Authors can see their own drafts
      if (user?.role === 'author') {
        return {
          or: [
            { status: { equals: 'published' } },
            { author: { equals: user.id } },
          ],
        };
      }
      // Public can only read published posts
      return {
        status: { equals: 'published' },
        publishedAt: { less_than_equal: new Date().toISOString() },
      };
    },
    create: ({ req: { user } }: any) => Boolean(user),
    update: ({ req: { user } }: any) => {
      if (user?.role === 'admin' || user?.role === 'editor') return true;
      if (user?.role === 'author') {
        return { author: { equals: user.id } };
      }
      return false;
    },
    delete: ({ req: { user } }: any) => user?.role === 'admin' || user?.role === 'editor',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Auto-generated from title, or set custom slug for SEO URL hygiene',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Brief overview displayed in listings and SEO snippets (140-160 chars)',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'featuredImageCaption',
      type: 'text',
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      required: true,
      index: true,
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      required: true,
      index: true,
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'draft',
      required: true,
      index: true,
    },
    {
      name: 'publishedAt',
      type: 'date',
      index: true,
    },
    {
      name: 'scheduledAt',
      type: 'date',
    },
    {
      name: 'readingTime',
      type: 'number',
      defaultValue: 5,
    },
    {
      name: 'views',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'allowComments',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      index: true,
    },
    {
      name: 'relatedPosts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'ogTitle', type: 'text' },
        { name: 'ogDescription', type: 'textarea' },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
        { name: 'canonicalUrl', type: 'text' },
        { name: 'noIndex', type: 'checkbox', defaultValue: false },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation }: any) => {
        if (operation === 'create' && data?.title && !data?.slug) {
          data.slug = data.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
        }
        return data;
      },
    ],
  },
};
