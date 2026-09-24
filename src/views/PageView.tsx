import React, { useEffect, useState } from 'react';
import { Page } from '../types/blog';
import { getPageBySlug } from '../api/pages';
import { storage } from '../lib/storage';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SEOHead } from '../components/SEOHead';
import { ContentRenderer } from '../components/ContentRenderer';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface PageViewProps {
  slug: string;
  onNavigate: (route: string) => void;
}

export const PageView: React.FC<PageViewProps> = ({ slug, onNavigate }) => {
  const [page, setPage] = useState<Page | null>(() => storage.getPageBySlug(slug));
  const [loading, setLoading] = useState<boolean>(!page);

  useEffect(() => {
    let isMounted = true;

    // Fast sync check first
    const cached = storage.getPageBySlug(slug);
    if (cached) {
      setPage(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    // Async check against Payload CMS API
    getPageBySlug(slug)
      .then((remotePage) => {
        if (isMounted && remotePage) {
          setPage(remotePage);
        }
      })
      .catch((err) => {
        console.warn(`[PageView] Could not fetch page "${slug}":`, err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-6 h-6 text-stone-600 animate-spin" />
        <span className="text-xs text-stone-500 font-mono">Retrieving document from CMS...</span>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold font-editorial text-stone-900">Page Not Found</h2>
        <p className="text-stone-500 text-sm max-w-sm mx-auto">
          The requested page "{slug}" could not be located in the CMS database.
        </p>
        <button
          onClick={() => onNavigate('/')}
          className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-xl hover:bg-stone-800 transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <SEOHead
        title={page.seo?.title || `${page.title} | NexusBlog`}
        description={page.seo?.description || page.title}
        ogImage={page.seo?.ogImage}
      />

      <Breadcrumbs items={[{ label: page.title }]} onNavigate={onNavigate} />

      <header className="border-b border-stone-200 pb-6">
        <h1 className="text-3xl sm:text-4xl font-bold font-editorial text-stone-950">
          {page.title}
        </h1>
        <p className="text-xs text-stone-400 mt-2 font-mono">
          Last updated: {new Date(page.updatedAt || page.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </header>

      <ContentRenderer content={page.content} />

      <div className="pt-8 border-t border-stone-200">
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-700 hover:text-stone-950"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </button>
      </div>
    </div>
  );
};
