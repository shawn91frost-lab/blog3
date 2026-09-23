import React from 'react';
import { storage } from '../lib/storage';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SEOHead } from '../components/SEOHead';
import { ArrowLeft } from 'lucide-react';

interface PageViewProps {
  slug: string;
  onNavigate: (route: string) => void;
}

export const PageView: React.FC<PageViewProps> = ({ slug, onNavigate }) => {
  const page = storage.getPageBySlug(slug);

  if (!page) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold font-editorial text-stone-900">Page Not Found</h2>
        <button
          onClick={() => onNavigate('/')}
          className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-xl"
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
      />

      <Breadcrumbs items={[{ label: page.title }]} onNavigate={onNavigate} />

      <header className="border-b border-stone-200 pb-6">
        <h1 className="text-3xl sm:text-4xl font-bold font-editorial text-stone-950">
          {page.title}
        </h1>
        <p className="text-xs text-stone-400 mt-2 font-mono">
          Last updated: {new Date(page.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </header>

      <div className="prose prose-stone text-stone-700 leading-relaxed font-sans whitespace-pre-line text-base sm:text-lg">
        {page.content}
      </div>

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
