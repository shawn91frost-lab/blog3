import { SiteSettings } from '../types/blog';
import { fetchFromPayload } from './client';
import { storage } from '../lib/storage';

/**
 * Fetches site global settings from Payload CMS Globals (/globals/site-settings)
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const doc = await fetchFromPayload<any>('/globals/site-settings');
    if (doc && (doc.siteName || doc.title)) {
      const fallback = storage.getSettings();
      return {
        siteName: doc.siteName || fallback.siteName,
        siteDescription: doc.siteDescription || fallback.siteDescription,
        siteUrl: doc.siteUrl || fallback.siteUrl,
        logo: doc.logo?.url || doc.logo || fallback.logo,
        favicon: doc.favicon?.url || doc.favicon || fallback.favicon,
        defaultSEOImage: doc.defaultSEOImage?.url || doc.defaultSEOImage || fallback.defaultSEOImage,
        email: doc.email || fallback.email,
        phone: doc.phone || fallback.phone,
        address: doc.address || fallback.address,
        copyrightText: doc.copyrightText || fallback.copyrightText,
        socialLinks: {
          ...fallback.socialLinks,
          ...(doc.socialLinks || {}),
        },
        analytics: {
          ...fallback.analytics,
          ...(doc.analytics || {}),
        },
        headerNav: fallback.headerNav,
        footerNav: fallback.footerNav,
      };
    }
  } catch (err) {
    console.warn('[API Layer] Unable to fetch site settings from Payload, using local settings:', (err as Error).message);
  }

  return storage.getSettings();
}
