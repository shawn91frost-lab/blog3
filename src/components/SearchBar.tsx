import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, BookOpen } from 'lucide-react';
import { storage } from '../lib/storage';
import { Post } from '../types/blog';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const res = storage.getPosts({ search: query, limit: 6, status: 'published' });
    setResults(res.posts);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-sm p-4 sm:p-6 md:p-20 flex justify-center items-start animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 border-b border-stone-200">
          <Search className="w-5 h-5 text-stone-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                onNavigate(`/search?q=${encodeURIComponent(query.trim())}`);
                onClose();
              }
            }}
            placeholder="Search articles by title, content, NestJS, Postgres, Supabase..."
            className="w-full py-4 text-stone-900 placeholder-stone-400 bg-transparent focus:outline-none text-base font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-stone-400 hover:text-stone-600 rounded mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-stone-400 bg-stone-100 rounded border border-stone-200">
            ESC
          </kbd>
        </div>

        {/* Quick Search Results Preview */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {query.trim() === '' ? (
            <div className="p-6 text-center text-xs text-stone-500 space-y-3">
              <p>Search across 20+ technical deep-dives, architectural blueprints, and engineering patterns.</p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="text-stone-400">Popular:</span>
                {['NestJS', 'PostgreSQL', 'Payload CMS', 'Supabase', 'TypeScript', '301 Redirects'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="text-stone-700 hover:text-stone-950 underline underline-offset-2"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                Matching Articles ({results.length})
              </div>
              {results.map((post) => (
                <div
                  key={post.id}
                  onClick={() => {
                    onNavigate(`/blog/${post.slug}`);
                    onClose();
                  }}
                  className="p-3 hover:bg-stone-50 rounded-xl cursor-pointer transition-colors flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] text-stone-500">
                      <span className="font-medium text-stone-700">{post.categories?.[0]?.name}</span>
                      <span>·</span>
                      <span>{post.readingTime} min read</span>
                    </div>
                    <h4 className="text-sm font-semibold text-stone-900 group-hover:text-amber-900 transition-colors">
                      {post.title}
                    </h4>
                    <p className="text-xs text-stone-500 line-clamp-1">
                      {post.excerpt}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-stone-900 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                </div>
              ))}
              <div className="pt-3 border-t border-stone-100 text-center">
                <button
                  onClick={() => {
                    onNavigate(`/search?q=${encodeURIComponent(query)}`);
                    onClose();
                  }}
                  className="text-xs font-medium text-stone-700 hover:text-stone-950 underline"
                >
                  View all full-text results for "{query}"
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-stone-500 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-stone-300" />
              <p className="text-sm font-medium text-stone-700">No articles matched "{query}"</p>
              <p className="text-xs text-stone-400">Try searching for keywords like "API", "indexing", or "architecture".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
