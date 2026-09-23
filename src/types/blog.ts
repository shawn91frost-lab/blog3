/**
 * NexusBlog Enterprise Domain Types
 * Defines data structures compatible with Payload CMS and Supabase PostgreSQL
 */

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'spam';
export type UserRole = 'admin' | 'editor' | 'author';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  avatar: string;
  bio: string;
  jobTitle: string;
  company?: string;
  socialLinks: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
  articleCount?: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  postCount?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount?: number;
}

export interface Media {
  id: string;
  filename: string;
  url: string;
  alt: string;
  caption?: string;
  mimeType: string;
  filesize: number; // bytes
  width?: number;
  height?: number;
  uploadedBy?: string;
  createdAt: string;
}

export interface SEOMetadata {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
}

export type ContentBlockType = 
  | 'heading'
  | 'paragraph'
  | 'blockquote'
  | 'code'
  | 'image'
  | 'table'
  | 'embed'
  | 'callout'
  | 'divider';

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  level?: 2 | 3 | 4; // for headings
  content?: string;
  language?: string; // for code
  caption?: string;
  url?: string;
  alt?: string;
  calloutType?: 'info' | 'warning' | 'tip' | 'note';
  tableData?: {
    headers: string[];
    rows: string[][];
  };
  embedUrl?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: ContentBlock[];
  rawHtmlContent?: string;
  featuredImage: string;
  featuredImageCaption?: string;
  authorId: string;
  author?: Author;
  categoryIds: string[];
  categories?: Category[];
  tagIds: string[];
  tags?: Tag[];
  status: PostStatus;
  publishedAt: string | null;
  scheduledAt?: string | null;
  readingTime: number; // in minutes
  views: number;
  allowComments: boolean;
  featured: boolean;
  seo?: SEOMetadata;
  relatedPostIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  parentId?: string | null; // For nested replies
  name: string;
  email: string;
  website?: string;
  comment: string;
  status: CommentStatus;
  createdAt: string;
  replies?: Comment[];
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  status: 'active' | 'unsubscribed';
  subscribedAt: string;
  unsubscribedAt?: string | null;
  source?: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  seo?: SEOMetadata;
  publishedAt: string;
  updatedAt: string;
}

export interface Redirect {
  id: string;
  source: string;
  destination: string;
  statusCode: 301 | 302;
  active: boolean;
  hitCount?: number;
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logo: string;
  favicon: string;
  defaultSEOImage: string;
  email: string;
  phone?: string;
  address?: string;
  copyrightText: string;
  socialLinks: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    youtube?: string;
    rss?: string;
  };
  analytics: {
    googleAnalyticsId?: string;
    googleSearchConsoleVerification?: string;
    plausibleDomain?: string;
    posthogKey?: string;
  };
  headerNav: {
    label: string;
    url: string;
  }[];
  footerNav: {
    section: string;
    links: { label: string; url: string }[];
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    timestamp?: string;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
