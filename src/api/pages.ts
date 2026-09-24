import { Page } from '../types/blog';
import { fetchFromPayload, PayloadApiResponse } from './client';
import { storage } from '../lib/storage';

/**
 * Normalizes a Payload CMS Page document into the frontend Page structure
 */
export function normalizePayloadPage(doc: any): Page {
  if (!doc) return doc;

  // Handle rich text or string content
  let content = '';
  if (typeof doc.content === 'string') {
    content = doc.content;
  } else if (doc.content && typeof doc.content === 'object') {
    // If Lexical or Slate or Block nodes
    if (Array.isArray(doc.content.root?.children)) {
      content = doc.content.root.children
        .map((node: any) => node.children?.map((c: any) => c.text || '').join('') || '')
        .filter(Boolean)
        .join('\n\n');
    } else {
      content = JSON.stringify(doc.content);
    }
  }

  return {
    id: doc.id?.toString() || doc._id?.toString() || Math.random().toString(),
    title: doc.title || 'Untitled Page',
    slug: doc.slug || '',
    content: content || doc.description || '',
    seo: doc.seo || {
      title: doc.title,
      description: doc.seoDescription || doc.title,
      ogImage: doc.featuredImage?.url || undefined,
    },
    publishedAt: doc.publishedAt || doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || new Date().toISOString(),
  };
}

/**
 * Fetches all published pages
 */
export async function getPages(): Promise<Page[]> {
  try {
    const response = await fetchFromPayload<PayloadApiResponse<any>>('/pages?limit=100');
    if (response && Array.isArray(response.docs) && response.docs.length > 0) {
      return response.docs.map(normalizePayloadPage);
    }
  } catch (err) {
    console.warn('[API Layer] Unable to fetch pages from Payload CMS, using local cache:', (err as Error).message);
  }

  return storage.getPages();
}

/**
 * Fetches a single page by slug (e.g. 'about', 'services', 'contact', etc.)
 */
export async function getPageBySlug(slug: string): Promise<Page | null> {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, '');

  try {
    const response = await fetchFromPayload<PayloadApiResponse<any>>(
      `/pages?where[slug][equals]=${encodeURIComponent(cleanSlug)}&limit=1`
    );

    if (response && Array.isArray(response.docs) && response.docs.length > 0) {
      return normalizePayloadPage(response.docs[0]);
    }
  } catch (err) {
    console.warn(`[API Layer] Unable to fetch page "${cleanSlug}" from Payload:`, (err as Error).message);
  }

  return storage.getPageBySlug(cleanSlug);
}
