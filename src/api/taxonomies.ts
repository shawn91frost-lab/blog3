import { Category, Tag } from '../types/blog';
import { fetchFromPayload, PayloadApiResponse } from './client';
import { storage } from '../lib/storage';

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetchFromPayload<PayloadApiResponse<any>>('/categories?limit=50');
    if (response && Array.isArray(response.docs) && response.docs.length > 0) {
      return response.docs.map((doc: any) => ({
        id: doc.id?.toString() || doc._id?.toString() || doc.slug,
        name: doc.name,
        slug: doc.slug,
        description: doc.description || '',
        image: doc.image?.url || doc.image || '',
        seoTitle: doc.seoTitle,
        seoDescription: doc.seoDescription,
        postCount: doc.postCount || 0,
      }));
    }
  } catch (err) {
    console.warn('[API Layer] Unable to fetch categories from Payload:', (err as Error).message);
  }
  return storage.getCategories();
}

export async function getTags(): Promise<Tag[]> {
  try {
    const response = await fetchFromPayload<PayloadApiResponse<any>>('/tags?limit=100');
    if (response && Array.isArray(response.docs) && response.docs.length > 0) {
      return response.docs.map((doc: any) => ({
        id: doc.id?.toString() || doc._id?.toString() || doc.slug,
        name: doc.name,
        slug: doc.slug,
        description: doc.description || '',
        postCount: doc.postCount || 0,
      }));
    }
  } catch (err) {
    console.warn('[API Layer] Unable to fetch tags from Payload:', (err as Error).message);
  }
  return storage.getTags();
}
