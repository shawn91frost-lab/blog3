import { Post } from '../types/blog';
import { fetchFromPayload, PayloadApiResponse } from './client';
import { storage } from '../lib/storage';

export interface GetPostsParams {
  page?: number;
  limit?: number;
  categorySlug?: string;
  tagSlug?: string;
  authorSlug?: string;
  search?: string;
  status?: 'published' | 'draft' | 'all';
  featured?: boolean;
}

export interface GetPostsResponse {
  posts: Post[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

/**
 * Normalizes a Payload CMS Post document into the frontend Post structure
 */
export function normalizePayloadPost(doc: any): Post {
  if (!doc) return doc;

  // Extract author
  let author = doc.author;
  let authorId = typeof doc.author === 'string' ? doc.author : doc.author?.id || 'unknown';

  // Extract categories
  const categories = Array.isArray(doc.categories)
    ? doc.categories.map((c: any) => (typeof c === 'string' ? { id: c, name: c, slug: c } : c))
    : [];
  const categoryIds = categories.map((c: any) => c.id);

  // Extract tags
  const tags = Array.isArray(doc.tags)
    ? doc.tags.map((t: any) => (typeof t === 'string' ? { id: t, name: t, slug: t } : t))
    : [];
  const tagIds = tags.map((t: any) => t.id);

  // Extract media featuredImage
  let featuredImage = '/src/assets/images/hero_nestjs_architecture_1790181779835.jpg';
  if (typeof doc.featuredImage === 'string') {
    featuredImage = doc.featuredImage;
  } else if (doc.featuredImage && typeof doc.featuredImage === 'object') {
    featuredImage = doc.featuredImage.url || featuredImage;
  }

  // Content blocks or rich text
  let content = doc.content;
  if (!Array.isArray(content) && content) {
    // If Payload Lexical or Slate root node
    content = [{ id: 'block-1', type: 'paragraph', content: typeof content === 'string' ? content : JSON.stringify(content) }];
  } else if (!content) {
    content = [];
  }

  return {
    id: doc.id?.toString() || doc._id?.toString() || Math.random().toString(),
    title: doc.title || 'Untitled Post',
    slug: doc.slug || '',
    excerpt: doc.excerpt || '',
    content,
    featuredImage,
    featuredImageCaption: doc.featuredImageCaption || '',
    authorId,
    author: typeof author === 'object' ? author : undefined,
    categoryIds,
    categories,
    tagIds,
    tags,
    status: doc.status || 'published',
    publishedAt: doc.publishedAt || doc.createdAt || null,
    readingTime: doc.readingTime || Math.max(2, Math.round((doc.excerpt?.length || 300) / 100)),
    views: doc.views || 0,
    allowComments: doc.allowComments ?? true,
    featured: Boolean(doc.featured),
    seo: doc.seo || {
      title: doc.title,
      description: doc.excerpt,
      ogImage: featuredImage,
    },
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || new Date().toISOString(),
  };
}

/**
 * Fetches paginated posts from Payload CMS with transparent fallback to local storage
 */
export async function getPosts(params: GetPostsParams = {}): Promise<GetPostsResponse> {
  const {
    page = 1,
    limit = 10,
    categorySlug,
    tagSlug,
    search,
    status = 'published',
    featured,
  } = params;

  try {
    const queryParts: string[] = [`page=${page}`, `limit=${limit}`];

    if (status !== 'all') {
      queryParts.push(`where[status][equals]=${status}`);
    }

    if (featured !== undefined) {
      queryParts.push(`where[featured][equals]=${featured}`);
    }

    if (categorySlug) {
      queryParts.push(`where[categories.slug][equals]=${encodeURIComponent(categorySlug)}`);
    }

    if (tagSlug) {
      queryParts.push(`where[tags.slug][equals]=${encodeURIComponent(tagSlug)}`);
    }

    if (search) {
      queryParts.push(`where[or][0][title][like]=${encodeURIComponent(search)}`);
      queryParts.push(`where[or][1][excerpt][like]=${encodeURIComponent(search)}`);
    }

    const queryString = queryParts.join('&');
    const response = await fetchFromPayload<PayloadApiResponse<any>>(`/posts?${queryString}`);

    if (response && Array.isArray(response.docs) && response.docs.length > 0) {
      return {
        posts: response.docs.map(normalizePayloadPost),
        total: response.totalDocs || response.docs.length,
        totalPages: response.totalPages || 1,
        page: response.page || 1,
        limit: response.limit || limit,
      };
    }
  } catch (err) {
    console.warn('[API Layer] Payload CMS unreachable or returned error, using local fallback:', (err as Error).message);
  }

  // Graceful fallback to client storage
  const localResult = storage.getPosts({
    page,
    limit,
    categorySlug,
    tagSlug,
    search,
    status,
    featured,
  });

  return {
    posts: localResult.posts,
    total: localResult.total,
    totalPages: localResult.totalPages,
    page: localResult.page,
    limit: localResult.limit,
  };
}

/**
 * Fetches a single post by slug from Payload CMS with fallback
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const response = await fetchFromPayload<PayloadApiResponse<any>>(
      `/posts?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`
    );

    if (response && Array.isArray(response.docs) && response.docs.length > 0) {
      return normalizePayloadPost(response.docs[0]);
    }
  } catch (err) {
    console.warn(`[API Layer] Unable to fetch post "${slug}" from Payload CMS:`, (err as Error).message);
  }

  // Fallback to local storage
  return storage.getPostBySlug(slug);
}
