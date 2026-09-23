import React, { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { Post } from '../types/blog';
import { PostCard } from '../components/PostCard';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SEOHead } from '../components/SEOHead';
import { Search, X, ArrowLeft } from 'lucide-react';

interface SearchViewProps {
  initialQuery?: string;
  onNavigate: (route: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ initialQuery = '', onNavigate }) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Post[]>([]);

  useEffect(() => {
    if (query.trim()) {
      const res = storage.getPosts({ search: query, status: 'published', limit: 30 });
      setResults(res.posts);
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div className="space-y-8">
      <SEOHead
        title={query ? `Search results for "${query}" | NexusBlog` : 'Search Articles | NexusBlog'}
        description={`Search results across engineering publications on NexusBlog.`}
      />

      <Breadcrumbs items={[{ label: 'Search' }]} onNavigate={onNavigate} />

      <div className="border-b border-stone-200 pb-6 space-y-4">
        <h1 className="text-3xl font-bold font-editorial text-stone-950">
          Search Engineering Publications
        </h1>

        <div className="relative max-w-2xl">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by keywords, architecture, PostgreSQL, NestJS, Supabase..."
            className="w-full pl-10 pr-10 py-3 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {query.trim() ? (
        <div className="space-y-6">
          <div className="text-xs text-stone-500 font-sans">
            Found {results.length} {results.length === 1 ? 'article' : 'articles'} matching "{query}"
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((post) => (
                <PostCard key={post.id} post={post} onNavigate={onNavigate} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-stone-200 rounded-2xl p-8 space-y-2">
              <p className="text-stone-700 font-medium">No publications found matching "{query}"</p>
              <p className="text-xs text-stone-400">Try searching for broader terms such as "database", "API", or "NestJS".</p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 bg-[#f5f4f0] border border-stone-200 rounded-2xl text-center text-sm text-stone-600 space-y-3">
          <p>Type keywords above to search across all published technical articles and code guides.</p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-stone-400">Suggested queries:</span>
            {['NestJS', 'PostgreSQL', 'Payload CMS', 'Supabase', 'TypeScript', 'Indexing', 'Microservices'].map((t) => (
              <button
                key={t}
                onClick={() => setQuery(t)}
                className="px-2.5 py-1 bg-white border border-stone-200 rounded-lg hover:border-stone-400 text-stone-700"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pt-8 border-t border-stone-200">
        <button
          onClick={() => onNavigate('/blog')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-700 hover:text-stone-950"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Publications</span>
        </button>
      </div>
    </div>
  );
};
