import path from 'path';
import { fileURLToPath } from 'url';
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';

import { Users } from './collections/Users';
import { Posts } from './collections/Posts';
import { Pages } from './collections/Pages';
import { Categories } from './collections/Categories';
import { Tags } from './collections/Tags';
import { Media } from './collections/Media';
import { Navigation } from './collections/Navigation';

import { SiteSettings } from './globals/SiteSettings';
import { SEODefaults } from './globals/SEODefaults';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- NexusBlog Studio',
      favicon: '/favicon.ico',
    },
  },
  collections: [
    Users,
    Posts,
    Pages,
    Categories,
    Tags,
    Media,
    Navigation,
  ],
  globals: [
    SiteSettings,
    SEODefaults,
  ],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'fallback_development_payload_secret_key_32_chars_min',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || 'postgresql://postgres:postgres@localhost:5432/nexusblog',
    },
  }),
  cors: corsOrigins,
  csrf: corsOrigins,
  rateLimit: {
    max: 500,
    window: 15 * 60 * 1000,
  },
});
