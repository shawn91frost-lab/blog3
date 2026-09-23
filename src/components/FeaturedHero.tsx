import React, { useState } from 'react';
import { Post } from '../types/blog';
import { ArrowUpRight, Clock, BookOpen } from 'lucide-react';

interface FeaturedHeroProps {
  post: Post;
  onNavigate: (route: string) => void;
}

export const FeaturedHero: React.FC<FeaturedHeroProps> = ({ post, onNavigate }) => {
  const [imgError, setImgError] = useState(false);

  const primaryCategory = post.categories?.[0]?.name || 'Architecture';
  const authorName = post.author?.name || 'Editorial Staff';
  const dateFormatted = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Draft';

  return (
    <section className="mb-14 pt-4">
      <div
        onClick={() => onNavigate(`/blog/${post.slug}`)}
        className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-stone-200/90 rounded-2xl overflow-hidden p-6 sm:p-8 lg:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.07)] hover:border-stone-300 transition-all duration-300"
      >
        {/* Left Column: Editorial Information */}
        <div className="lg:col-span-6 space-y-5 flex flex-col justify-center">
          {/* Zero-Pill Unboxed Text Metadata */}
          <div className="flex items-center gap-2.5 text-xs text-stone-500 font-sans">
            <span className="font-semibold tracking-wider uppercase text-amber-900">Featured Study</span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-stone-700">{primaryCategory}</span>
            <span aria-hidden="true">·</span>
            <span>{dateFormatted}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-editorial text-stone-950 leading-[1.2] group-hover:text-amber-950 transition-colors">
            {post.title}
          </h1>

          <p className="text-stone-600 text-sm sm:text-base leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-stone-100 text-xs text-stone-600">
            <div className="flex items-center gap-2.5">
              {post.author?.avatar && (
                <img
                  src={post.author.avatar}
                  alt={authorName}
                  className="w-8 h-8 rounded-full object-cover border border-stone-200"
                  referrerPolicy="no-referrer"
                />
              )}
              <div>
                <p className="font-semibold text-stone-900">{authorName}</p>
                <p className="text-[11px] text-stone-500">{post.author?.jobTitle || 'Contributor'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 font-mono text-stone-500">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime} min read
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-stone-950 group-hover:translate-x-1 transition-transform">
                Read Publication <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: High-Resolution Featured Image */}
        <div className="lg:col-span-6 aspect-[16/10] overflow-hidden rounded-xl bg-stone-100 relative">
          {!imgError && post.featuredImage ? (
            <img
              src={post.featuredImage}
              alt={post.title}
              onError={() => setImgError(true)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-stone-200 text-stone-500 space-y-2">
              <BookOpen className="w-8 h-8 opacity-40" />
              <span className="text-xs font-mono">Nexus Lead Architecture</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
