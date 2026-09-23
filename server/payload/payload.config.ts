/**
 * Payload CMS Configuration
 * Official Schema & Config definition integrating Supabase PostgreSQL
 */

export interface AccessArgs {
  req: {
    user?: {
      id: string;
      role: 'admin' | 'editor' | 'author';
    };
  };
  id?: string;
  data?: unknown;
}

export const isAdmin = ({ req: { user } }: AccessArgs) => Boolean(user?.role === 'admin');
export const isEditorOrAdmin = ({ req: { user } }: AccessArgs) => 
  Boolean(user?.role === 'admin' || user?.role === 'editor');
export const isAuthorOrAbove = ({ req: { user } }: AccessArgs) => 
  Boolean(user?.role === 'admin' || user?.role === 'editor' || user?.role === 'author');

export const payloadConfig = {
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- NexusBlog Studio',
      favicon: '/favicon.ico',
      ogImage: '/og-admin.png',
    },
  },
  collections: [
    'Users',
    'Posts',
    'Categories',
    'Tags',
    'Authors',
    'Media',
    'Comments',
    'NewsletterSubscribers',
    'Pages',
    'Redirects',
  ],
  globals: [
    'SiteSettings',
    'Header',
    'Footer',
    'SEODefaults',
  ],
  cors: [process.env.APP_URL || 'http://localhost:3000'],
  csrf: [process.env.APP_URL || 'http://localhost:3000'],
  rateLimit: {
    max: 500,
    window: 15 * 60 * 1000,
  },
};
