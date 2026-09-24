import type { GlobalConfig } from 'payload';

export const SEODefaults: GlobalConfig = {
  slug: 'seo-defaults',
  admin: {
    group: 'Site Settings',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }: any) => user?.role === 'admin' || user?.role === 'editor',
  },
  fields: [
    {
      name: 'titleTemplate',
      type: 'text',
      defaultValue: '%s | NexusBlog Enterprise',
      admin: {
        description: 'Template pattern used for article and page titles',
      },
    },
    {
      name: 'defaultDescription',
      type: 'textarea',
      defaultValue: 'Authoritative engineering articles, system benchmarks, database optimization tutorials, and cloud architecture case studies.',
    },
    {
      name: 'defaultOGImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'twitterCardType',
      type: 'select',
      defaultValue: 'summary_large_image',
      options: [
        { label: 'Summary with Large Image', value: 'summary_large_image' },
        { label: 'Summary', value: 'summary' },
      ],
    },
  ],
};
