import React from 'react';
import { storage } from '../lib/storage';
import { PostCard } from '../components/PostCard';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SEOHead } from '../components/SEOHead';
import { Layers, ArrowLeft } from 'lucide-react';

interface CategoryViewProps {
  slug: string;
  onNavigate: (route: string) => void;
}

export const CategoryView: React.FC<CategoryViewProps> = ({ slug, onNavigate }) => {
  const category = storage.getCategoryBySlug(slug);
  const postsResult = storage.getPosts({ categorySlug: slug, status: 'published', limit: 20 });
  const posts = postsResult.posts;

  if (!category) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold font-editorial text-stone-900">Category Not Found</h2>
        <button
          onClick={() => onNavigate('/blog')}
          className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-xl"
        >
          Return to Blog
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SEOHead
        title={category.seoTitle || `${category.name} | NexusBlog Architecture Journal`}
        description={category.seoDescription || category.description}
      />

      <Breadcrumbs
        items={[{ label: 'Articles', url: '/blog' }, { label: category.name }]}
        onNavigate={onNavigate}
      />

      {/* Category Hero Banner */}
      <div className="p-8 sm:p-10 bg-[#f5f4f0] border border-stone-200 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-900 font-sans">
          <Layers className="w-4 h-4" />
          <span>Technical Category</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-editorial text-stone-950">
          {category.name}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base max-w-3xl leading-relaxed">
          {category.description}
        </p>
        <div className="pt-2 text-xs font-mono text-stone-500">
          {category.postCount || posts.length} published {posts.length === 1 ? 'article' : 'articles'}
        </div>
      </div>

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-stone-200 rounded-2xl p-8">
          <p className="text-stone-600 text-sm">No published articles in this category yet.</p>
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
