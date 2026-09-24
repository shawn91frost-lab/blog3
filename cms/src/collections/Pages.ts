import type { CollectionConfig } from 'payload';

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'publishedAt'],
    group: 'Content',
  },
  access: {
    read: ({ req: { user } }: any) => {
      if (user?.role === 'admin' || user?.role === 'editor') return true;
      return {
        status: { equals: 'published' },
      };
    },
    create: ({ req: { user } }: any) => user?.role === 'admin' || user?.role === 'editor',
    update: ({ req: { user } }: any) => user?.role === 'admin' || user?.role === 'editor',
    delete: ({ req: { user } }: any) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Frontend URL route path (e.g., "about", "services", "privacy")',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description: 'Body copy and rich layouts',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'published',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', admin: { description: 'SEO title tag' } },
        { name: 'description', type: 'textarea', admin: { description: 'Meta description' } },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
};
