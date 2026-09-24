import type { CollectionConfig } from 'payload';

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'publishedAt', 'views'],
    group: 'Content',
  },
  access: {
    read: ({ req: { user } }: any) => {
      // Admins and editors can read drafts
      if (user?.role === 'admin' || user?.role === 'editor') return true;
      // Authors can read their own drafts
      if (user?.role === 'author') {
        return {
          or: [
            { status: { equals: 'published' } },
            { author: { equals: user.id } },
          ],
        };
      }
      // Public audience: only published posts
      return {
        status: { equals: 'published' },
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
        description: 'Clean URL path slug (e.g. /blog/my-first-post)',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Brief summary displayed in article feeds and search listings',
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
      relationTo: 'users',
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
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'readingTime',
      type: 'number',
      defaultValue: 5,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'views',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Highlight as lead publication on homepage hero',
      },
    },
    {
      name: 'allowComments',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', admin: { description: 'Custom SEO title' } },
        { name: 'description', type: 'textarea', admin: { description: 'Custom Meta description' } },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
};
