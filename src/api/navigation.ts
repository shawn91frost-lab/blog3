import { fetchFromPayload, PayloadApiResponse } from './client';
import { storage } from '../lib/storage';

export interface NavItem {
  id?: string;
  label: string;
  url: string;
  order?: number;
  isActive?: boolean;
  parentItem?: string | null;
}

export interface NavigationMenu {
  title: string;
  location: 'header' | 'footer';
  items: NavItem[];
}

/**
 * Fetches navigation menu items for a specific location ('header' | 'footer')
 */
export async function getNavigation(location: 'header' | 'footer' = 'header'): Promise<NavItem[]> {
  try {
    const response = await fetchFromPayload<PayloadApiResponse<any>>(
      `/navigation?where[location][equals]=${location}&limit=1`
    );

    if (response && Array.isArray(response.docs) && response.docs.length > 0) {
      const menu = response.docs[0];
      if (Array.isArray(menu.items) && menu.items.length > 0) {
        return menu.items
          .filter((item: any) => item.isActive !== false)
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
          .map((item: any) => ({
            label: item.label,
            url: item.url || (item.page?.slug ? `/${item.page.slug}` : '/'),
            order: item.order,
            isActive: item.isActive ?? true,
          }));
      }
    }
  } catch (err) {
    console.warn(`[API Layer] Unable to fetch ${location} navigation from Payload:`, (err as Error).message);
  }

  // Fallback to local settings navigation
  const settings = storage.getSettings();
  if (location === 'header') {
    return settings.headerNav || [];
  }
  return (
    settings.footerNav?.flatMap((section) =>
      section.links.map((link) => ({
        label: `${section.section} - ${link.label}`,
        url: link.url,
      }))
    ) || []
  );
}
