import React, { useState } from 'react';
import { Post } from '../types/blog';
import { ArrowUpRight, Clock, Eye } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onNavigate: (route: string) => void;
  layout?: 'standard' | 'compact' | 'horizontal';
}

export const PostCard: React.FC<PostCardProps> = ({ post, onNavigate, layout = 'standard' }) => {
  const [imgError, setImgError] = useState(false);

  const primaryCategory = post.categories?.[0]?.name || 'Architecture';
  const authorName = post.author?.name || 'Editorial Staff';
  const dateFormatted = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Draft';

  if (layout === 'compact') {
    return (
      <article
        onClick={() => onNavigate(`/blog/${post.slug}`)}
        className="group cursor-pointer py-4 border-b border-stone-200/80 last:border-0 hover:bg-stone-50/50 transition-colors"
      >
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
          <span className="font-medium text-stone-700">{primaryCategory}</span>
          <span aria-hidden="true">·</span>
          <span>{post.readingTime} min read</span>
        </div>
        <h3 className="text-base font-semibold text-stone-900 group-hover:text-amber-900 transition-colors line-clamp-2">
          {post.title}
        </h3>
      </article>
    );
  }

  if (layout === 'horizontal') {
    return (
      <article
        onClick={() => onNavigate(`/blog/${post.slug}`)}
        className="group cursor-pointer grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-6 border-b border-stone-200 hover:bg-stone-50/60 p-3 rounded-xl transition-all"
      >
        <div className="md:col-span-4 aspect-video overflow-hidden rounded-lg bg-stone-100 relative">
          {!imgError && post.featuredImage ? (
            <img
              src={post.featuredImage}
              alt={post.title}
              onError={() => setImgError(true)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400 text-xs font-mono">
              Nexus Architecture
            </div>
          )}
        </div>
        <div className="md:col-span-8 space-y-2">
          {/* Zero-Pill metadata */}
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="font-semibold text-stone-800">{primaryCategory}</span>
            <span aria-hidden="true">·</span>
            <span>{dateFormatted}</span>
            <span aria-hidden="true">·</span>
            <span>{post.readingTime} min read</span>
          </div>

          <h3 className="text-xl font-bold text-stone-900 group-hover:text-amber-900 font-editorial transition-colors">
            {post.title}
          </h3>

          <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between pt-2 text-xs text-stone-500">
            <span className="font-medium text-stone-700">By {authorName}</span>
            <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 text-stone-800 font-medium">
              Read article <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={() => onNavigate(`/blog/${post.slug}`)}
      className="group cursor-pointer flex flex-col bg-white border border-stone-200/90 rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-stone-300 transition-all duration-300"
    >
      {/* Visual Header */}
      <div className="aspect-[16/10] overflow-hidden bg-stone-100 relative">
        {!imgError && post.featuredImage ? (
          <img
            src={post.featuredImage}
            alt={post.title}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400 text-xs font-mono">
            Nexus Engineering
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Zero-Pill Unboxed Text Metadata */}
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="font-medium text-stone-800">{primaryCategory}</span>
            <span aria-hidden="true">·</span>
            <span>{dateFormatted}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 inline" />
              {post.readingTime} min
            </span>
          </div>

          <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-900 font-editorial leading-snug transition-colors line-clamp-2">
            {post.title}
          </h3>

          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        {/* Footer info: author and views */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            {post.author?.avatar && (
              <img
                src={post.author.avatar}
                alt={authorName}
                className="w-5 h-5 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}
            <span className="font-medium text-stone-700">{authorName}</span>
          </div>
          <div className="flex items-center gap-1 text-stone-400 font-mono text-[11px] tabular-nums">
            <Eye className="w-3 h-3" />
            <span>{post.views.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </article>
  );
};
