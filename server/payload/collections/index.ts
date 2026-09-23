/**
 * Payload Collections Export
 * Complete CMS collection definitions for WordPress replacement
 */

export const UsersCollection = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }: any) => user?.role === 'admin',
    update: ({ req: { user } }: any) => user?.role === 'admin',
    delete: ({ req: { user } }: any) => user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Author', value: 'author' },
      ],
      defaultValue: 'author',
      required: true,
    },
    { name: 'avatar', type: 'text' },
  ],
};

export const CategoriesCollection = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    group: 'Taxonomy',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'description', type: 'textarea' },
    { name: 'image', type: 'text' },
    { name: 'seoTitle', type: 'text' },
    { name: 'seoDescription', type: 'textarea' },
  ],
};

export const TagsCollection = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    group: 'Taxonomy',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'description', type: 'textarea' },
  ],
};

export const AuthorsCollection = {
  slug: 'authors',
  admin: {
    useAsTitle: 'name',
    group: 'People',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'avatar', type: 'text', required: true },
    { name: 'bio', type: 'textarea', required: true },
    { name: 'jobTitle', type: 'text', required: true },
    { name: 'company', type: 'text' },
    {
      name: 'socialLinks',
      type: 'group',
      fields: [
        { name: 'twitter', type: 'text' },
        { name: 'github', type: 'text' },
        { name: 'linkedin', type: 'text' },
        { name: 'website', type: 'text' },
      ],
    },
  ],
};

export const MediaCollection = {
  slug: 'media',
  upload: {
    staticURL: '/media',
    staticDir: 'media',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'],
  },
  fields: [
    { name: 'alt', type: 'text', required: true },
    { name: 'caption', type: 'text' },
  ],
};

export const CommentsCollection = {
  slug: 'comments',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'post', 'status', 'createdAt'],
    group: 'Engagement',
  },
  fields: [
    { name: 'post', type: 'relationship', relationTo: 'posts', required: true },
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'website', type: 'text' },
    { name: 'comment', type: 'textarea', required: true },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Spam', value: 'spam' },
      ],
      defaultValue: 'pending',
      required: true,
    },
  ],
};

export const NewsletterSubscribersCollection = {
  slug: 'newsletter-subscribers',
  admin: {
    useAsTitle: 'email',
    group: 'Engagement',
  },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true },
    { name: 'name', type: 'text' },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Unsubscribed', value: 'unsubscribed' },
      ],
      defaultValue: 'active',
    },
    { name: 'subscribedAt', type: 'date' },
    { name: 'unsubscribedAt', type: 'date' },
  ],
};

export const PagesCollection = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'content', type: 'richText', required: true },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
      ],
    },
  ],
};

export const RedirectsCollection = {
  slug: 'redirects',
  admin: {
    useAsTitle: 'source',
    group: 'Settings',
  },
  fields: [
    { name: 'source', type: 'text', required: true, unique: true },
    { name: 'destination', type: 'text', required: true },
    {
      name: 'statusCode',
      type: 'select',
      options: [
        { label: '301 Permanent', value: 301 },
        { label: '302 Temporary', value: 302 },
      ],
      defaultValue: 301,
    },
    { name: 'active', type: 'checkbox', defaultValue: true },
    { name: 'hitCount', type: 'number', defaultValue: 0 },
  ],
};
