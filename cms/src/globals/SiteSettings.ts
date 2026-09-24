import type { GlobalConfig } from 'payload';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    group: 'Site Settings',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }: any) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'NexusBlog',
      admin: {
        description: 'Brand name displayed in header and footer',
      },
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      required: true,
      defaultValue: 'Production engineering journal covering distributed systems, PostgreSQL, NestJS, and cloud infrastructure.',
    },
    {
      name: 'siteUrl',
      type: 'text',
      required: true,
      defaultValue: 'https://nexusblog.dev',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'contactEmail',
      type: 'email',
      required: true,
      defaultValue: 'contact@nexusblog.dev',
    },
    {
      name: 'copyrightText',
      type: 'text',
      defaultValue: '© 2026 NexusBlog Platform. Enterprise architecture publication.',
    },
    {
      name: 'socialLinks',
      type: 'group',
      fields: [
        { name: 'twitter', type: 'text', admin: { placeholder: 'https://twitter.com/nexusblog' } },
        { name: 'github', type: 'text', admin: { placeholder: 'https://github.com/nexusblog' } },
        { name: 'linkedin', type: 'text', admin: { placeholder: 'https://linkedin.com/company/nexusblog' } },
        { name: 'youtube', type: 'text', admin: { placeholder: 'https://youtube.com/@nexusblog' } },
      ],
    },
  ],
};
