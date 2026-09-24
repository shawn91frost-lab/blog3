import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    group: 'Assets',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }: any) => Boolean(user),
    update: ({ req: { user } }: any) => Boolean(user),
    delete: ({ req: { user } }: any) => user?.role === 'admin' || user?.role === 'editor',
  },
  upload: {
    staticDir: 'public/media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 512,
        position: 'centre',
      },
      {
        name: 'featured',
        width: 1920,
        height: 1080,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*', 'application/pdf'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Crucial for accessibility and SEO image indexation',
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Optional caption rendered beneath article images',
      },
    },
  ],
};
