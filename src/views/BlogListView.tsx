import React, { useState, useMemo } from 'react';
import { Post, Category, Tag } from '../types/blog';
import { PostCard } from '../components/PostCard';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Search, SlidersHorizontal, Grid, List, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface BlogListViewProps {
  posts: Post[];
  categories: Category[];
  tags: Tag[];
  onNavigate: (route: string) => void;
  initialCategory?: string;
  initialTag?: string;
}

export const BlogListView: React.FC<BlogListViewProps> = ({
  posts,
  categories,
  tags,
  onNavigate,
  initialCategory,
  initialTag,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedTag, setSelectedTag] = useState<string>(initialTag || 'all');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'views' | 'readingTime'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [layout, setLayout] = useState<'grid' | 'horizontal'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 9;

  // Filtered & Sorted Posts
  const filteredPosts = useMemo(() => {
    let result = posts.filter((p) => p.status === 'published');

    if (selectedCategory !== 'all') {
      const cat = categories.find((c) => c.slug === selectedCategory);
      if (cat) {
        result = result.filter((p) => p.categoryIds.includes(cat.id));
      }
    }

    if (selectedTag !== 'all') {
      const tag = tags.find((t) => t.slug === selectedTag);
      if (tag) {
        result = result.filter((p) => p.tagIds.includes(tag.id));
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.content.some((b) => b.content?.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortOption === 'views') return b.views - a.views;
      if (sortOption === 'readingTime') return a.readingTime - b.readingTime;
      if (sortOption === 'oldest') {
        return new Date(a.publishedAt || a.createdAt).getTime() - new Date(b.publishedAt || b.createdAt).getTime();
      }
      return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();
    });

    return result;
  }, [posts, categories, tags, selectedCategory, selectedTag, searchQuery, sortOption]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE) || 1;
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedTag('all');
    setSearchQuery('');
    setSortOption('newest');
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedTag !== 'all' || searchQuery.trim() !== '';

  return (
    <div className="space-y-8">
      <SEOHead
        title="Engineering Publications & Architectural Studies | NexusBlog"
        description="Comprehensive archive of deep-dive backend engineering guides, PostgreSQL indexing blueprints, and Payload CMS implementations."
      />

      <Breadcrumbs items={[{ label: 'Articles Catalog' }]} onNavigate={onNavigate} />

      {/* Header title */}
      <div className="border-b border-stone-200 pb-6">
        <h1 className="text-3xl sm:text-4xl font-bold font-editorial text-stone-950 mb-2">
          Engineering Publications Catalog
        </h1>
        <p className="text-stone-600 text-sm max-w-2xl leading-relaxed">
          Peer-reviewed articles, production postmortems, and system design patterns for backend architects, distributed system teams, and full-stack engineers.
        </p>
      </div>

      {/* Controls Bar */}
      <div className="bg-[#f5f4f0] border border-stone-200/90 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search catalog articles..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-stone-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Selectors and Layout Switches */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            
            {/* Category selector */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-stone-800 font-sans"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Sort selector */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-stone-800 font-sans"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="views">Sort: Most Read</option>
              <option value="readingTime">Sort: Shortest Read</option>
            </select>

            {/* View Mode */}
            <div className="hidden sm:flex items-center border border-stone-300 rounded-xl overflow-hidden bg-white p-0.5">
              <button
                onClick={() => setLayout('grid')}
                className={`p-1.5 rounded-lg text-xs ${layout === 'grid' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'}`}
                title="Grid layout"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setLayout('horizontal')}
                className={`p-1.5 rounded-lg text-xs ${layout === 'horizontal' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'}`}
                title="List layout"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tag Pill-Less Filter Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-300/60 text-xs">
          <span className="text-stone-500 font-medium">Topic Filter:</span>
          <button
            onClick={() => {
              setSelectedTag('all');
              setCurrentPage(1);
            }}
            className={`transition-colors py-1 px-2.5 rounded-lg text-xs ${
              selectedTag === 'all'
                ? 'bg-stone-900 text-white font-medium'
                : 'text-stone-600 hover:text-stone-900 bg-stone-200/60'
            }`}
          >
            All Topics
          </button>
          {tags.slice(0, 10).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setSelectedTag(t.slug);
                setCurrentPage(1);
              }}
              className={`transition-colors py-1 px-2.5 rounded-lg text-xs ${
                selectedTag === t.slug
                  ? 'bg-stone-900 text-white font-medium'
                  : 'text-stone-600 hover:text-stone-900 bg-stone-200/60'
              }`}
            >
              #{t.name}
            </button>
          ))}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="ml-auto text-xs text-amber-900 hover:underline flex items-center gap-1 font-medium"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span>
          Showing {paginatedPosts.length} of {filteredPosts.length} publications
        </span>
        <span>Page {currentPage} of {totalPages}</span>
      </div>

      {/* Article Grid or List */}
      {paginatedPosts.length > 0 ? (
        layout === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedPosts.map((post) => (
              <PostCard key={post.id} post={post} onNavigate={onNavigate} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedPosts.map((post) => (
              <PostCard key={post.id} post={post} onNavigate={onNavigate} layout="horizontal" />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-16 bg-white border border-stone-200 rounded-2xl p-8 space-y-4">
          <p className="text-base font-semibold text-stone-900">No articles matched your filter criteria.</p>
          <p className="text-xs text-stone-500">Try choosing a different category or clearing search terms.</p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-xl hover:bg-stone-800"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8 border-t border-stone-200">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-transparent"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={`w-9 h-9 text-xs font-medium rounded-xl transition-colors ${
                currentPage === num
                  ? 'bg-stone-900 text-white font-bold'
                  : 'border border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-transparent"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
