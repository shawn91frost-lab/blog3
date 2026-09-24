import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role', 'createdAt'],
    group: 'Administration',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }: any) => user?.role === 'admin',
    update: ({ req: { user }, id }: any) => {
      if (user?.role === 'admin') return true;
      // Users can update their own profile
      return user?.id === id;
    },
    delete: ({ req: { user } }: any) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'author',
      options: [
        { label: 'Administrator (Full Access)', value: 'admin' },
        { label: 'Editor (Content & Media Management)', value: 'editor' },
        { label: 'Author (Post Creation & Personal Articles)', value: 'author' },
      ],
      access: {
        update: ({ req: { user } }: any) => user?.role === 'admin',
      },
    },
    {
      name: 'avatar',
      type: 'text',
      admin: {
        description: 'Avatar image URL or upload reference',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      admin: {
        description: 'Author biographical summary',
      },
    },
    {
      name: 'jobTitle',
      type: 'text',
    },
  ],
};
