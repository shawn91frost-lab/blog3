import type { CollectionConfig } from 'payload';

export const Navigation: CollectionConfig = {
  slug: 'navigation',
  admin: {
    useAsTitle: 'title',
    group: 'Navigation & Menus',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }: any) => user?.role === 'admin' || user?.role === 'editor',
    update: ({ req: { user } }: any) => user?.role === 'admin' || user?.role === 'editor',
    delete: ({ req: { user } }: any) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Menu name identifier (e.g. "Main Header Menu")',
      },
    },
    {
      name: 'location',
      type: 'select',
      required: true,
      unique: true,
      options: [
        { label: 'Header Top Navigation', value: 'header' },
        { label: 'Footer Bottom Navigation', value: 'footer' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            description: 'Link text displayed in menu',
          },
        },
        {
          name: 'type',
          type: 'radio',
          defaultValue: 'custom',
          options: [
            { label: 'Internal CMS Page', value: 'page' },
            { label: 'Custom URL / Path', value: 'custom' },
          ],
        },
        {
          name: 'page',
          type: 'relationship',
          relationTo: 'pages',
          admin: {
            condition: (_: any, siblingData: any) => siblingData?.type === 'page',
          },
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            condition: (_: any, siblingData: any) => siblingData?.type === 'custom',
            description: 'Custom path (e.g. /blog, /about, or external link)',
          },
        },
        {
          name: 'order',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'isActive',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'parentItem',
          type: 'text',
          admin: {
            description: 'Optional parent label for nested dropdown hierarchies',
          },
        },
      ],
    },
  ],
};
