import React, { useEffect, useState } from 'react';
import { Post, Comment } from '../types/blog';
import { storage } from '../lib/storage';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ContentRenderer } from '../components/ContentRenderer';
import { TableOfContents } from '../components/TableOfContents';
import { ReadingProgress } from '../components/ReadingProgress';
import { ShareButtons } from '../components/ShareButtons';
import { CommentForm } from '../components/CommentForm';
import { CommentList } from '../components/CommentList';
import { PostCard } from '../components/PostCard';
import { SEOHead } from '../components/SEOHead';
import { Clock, Eye, Calendar, ArrowLeft, ArrowUpRight, Tag as TagIcon, Sparkles } from 'lucide-react';

interface SinglePostViewProps {
  slug: string;
  onNavigate: (route: string) => void;
}

export const SinglePostView: React.FC<SinglePostViewProps> = ({ slug, onNavigate }) => {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // Look up post
    const found = storage.getPostBySlug(slug, true);
    setPost(found);

    if (found) {
      // Increment views
      storage.incrementPostViews(slug);

      // Load comments
      setComments(storage.getComments(found.id));

      // Load related posts
      if (found.relatedPostIds && found.relatedPostIds.length > 0) {
        const related = storage.getPosts({ status: 'published', limit: 10 }).posts
          .filter((p) => found.relatedPostIds?.includes(p.id) || (p.categoryIds.some((c) => found.categoryIds.includes(c)) && p.id !== found.id))
          .slice(0, 3);
        setRelatedPosts(related);
      } else {
        const related = storage.getPosts({ status: 'published', limit: 10 }).posts
          .filter((p) => p.categoryIds.some((c) => found.categoryIds.includes(c)) && p.id !== found.id)
          .slice(0, 3);
        setRelatedPosts(related);
      }
    }
  }, [slug]);

  const refreshComments = () => {
    if (post) {
      setComments(storage.getComments(post.id));
    }
  };

  if (!post) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold font-editorial text-stone-900">Article Not Found</h2>
        <p className="text-stone-500 text-sm">The publication you requested may have been moved, archived, or drafted.</p>
        <button
          onClick={() => onNavigate('/blog')}
          className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-xl hover:bg-stone-800"
        >
          Return to All Articles
        </button>
      </div>
    );
  }

  const primaryCategory = post.categories?.[0];
  const author = post.author;
  const dateFormatted = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Draft';

  const breadcrumbs = [
    { label: 'Articles', url: '/blog' },
    ...(primaryCategory ? [{ label: primaryCategory.name, url: `/category/${primaryCategory.slug}` }] : []),
    { label: post.title },
  ];

  return (
    <article className="relative">
      <ReadingProgress />

      <SEOHead
        title={post.seo?.title || `${post.title} | NexusBlog`}
        description={post.seo?.description || post.excerpt}
        ogImage={post.featuredImage}
        canonicalUrl={`https://nexusblog.dev/blog/${post.slug}`}
        type="article"
        publishedTime={post.publishedAt || post.createdAt}
        authorName={author?.name}
      />

      <div className="mb-6">
        <Breadcrumbs items={breadcrumbs} onNavigate={onNavigate} />
      </div>

      {/* Article Header */}
      <header className="mb-10 space-y-5 max-w-4xl">
        {/* Zero-Pill Unboxed Text Metadata */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-sans">
          {primaryCategory && (
            <button
              onClick={() => onNavigate(`/category/${primaryCategory.slug}`)}
              className="font-semibold text-amber-900 uppercase tracking-wider hover:underline"
            >
              {primaryCategory.name}
            </button>
          )}
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 inline" />
            {dateFormatted}
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 inline" />
            {post.readingTime} min read
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1 font-mono text-[11px] tabular-nums text-stone-400">
            <Eye className="w-3.5 h-3.5 inline" />
            {post.views.toLocaleString()} views
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-editorial text-stone-950 leading-[1.15] text-balance">
          {post.title}
        </h1>

        <p className="text-lg sm:text-xl text-stone-600 font-sans leading-relaxed">
          {post.excerpt}
        </p>

        {/* Author Byline & Social Sharing Row */}
        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {author && (
            <div
              onClick={() => onNavigate(`/author/${author.slug}`)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <img
                src={author.avatar}
                alt={author.name}
                className="w-11 h-11 rounded-full object-cover border border-stone-200 group-hover:ring-2 group-hover:ring-stone-400 transition-all"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="text-sm font-semibold text-stone-900 group-hover:text-amber-900 transition-colors">
                  {author.name}
                </p>
                <p className="text-xs text-stone-500">{author.jobTitle} · {author.company}</p>
              </div>
            </div>
          )}

          <ShareButtons title={post.title} />
        </div>
      </header>

      {/* Featured Media / Lead Image */}
      {post.featuredImage && (
        <figure className="mb-12 space-y-2">
          <div className="aspect-[16/9] lg:aspect-[21/9] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm relative">
            {!imgError ? (
              <img
                src={post.featuredImage}
                alt={post.title}
                onError={() => setImgError(true)}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-500 font-mono text-sm">
                Nexus Engineering Archive
              </div>
            )}
          </div>
          {post.featuredImageCaption && (
            <figcaption className="text-center text-xs text-stone-500 font-sans italic">
              {post.featuredImageCaption}
            </figcaption>
          )}
        </figure>
      )}

      {/* Article Content Layout: Main Prose + Sticky Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content Column */}
        <main className="lg:col-span-8 space-y-10">
          <ContentRenderer blocks={post.content} />

          {/* Tags Row */}
          {post.tags && post.tags.length > 0 && (
            <div className="pt-8 border-t border-stone-200 flex flex-wrap items-center gap-2">
              <span className="text-xs text-stone-400 font-medium mr-1 flex items-center gap-1">
                <TagIcon className="w-3.5 h-3.5" /> Topics:
              </span>
              {post.tags.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onNavigate(`/tag/${t.slug}`)}
                  className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-950 rounded-lg text-xs font-medium transition-colors"
                >
                  #{t.name}
                </button>
              ))}
            </div>
          )}

          {/* Author Biography Card */}
          {author && (
            <div className="p-6 bg-[#f7f5f0] border border-stone-200 rounded-2xl flex flex-col sm:flex-row gap-5 items-start">
              <img
                src={author.avatar}
                alt={author.name}
                className="w-16 h-16 rounded-full object-cover border border-stone-300 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold font-editorial text-stone-900">
                    Written by {author.name}
                  </h4>
                  <button
                    onClick={() => onNavigate(`/author/${author.slug}`)}
                    className="text-xs font-semibold text-stone-700 hover:text-stone-950 inline-flex items-center gap-1"
                  >
                    <span>View all {author.articleCount} articles</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {author.bio}
                </p>
              </div>
            </div>
          )}

          {/* Interactive Comments & Discussions */}
          {post.allowComments && (
            <section className="pt-8 border-t border-stone-200 space-y-8">
              <CommentForm
                postId={post.id}
                onCommentSubmitted={refreshComments}
              />
              <CommentList
                comments={comments}
                postId={post.id}
                onCommentAdded={refreshComments}
              />
            </section>
          )}
        </main>

        {/* Sticky Sidebar Column */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            <TableOfContents content={post.content} />

            {/* Quick Share Widget */}
            <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-sm space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block font-sans">
                Share this study
              </span>
              <ShareButtons title={post.title} />
            </div>

            {/* Related Publications */}
            {relatedPosts.length > 0 && (
              <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-900" />
                  <span>Related Architecture Studies</span>
                </div>
                <div className="space-y-4">
                  {relatedPosts.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => onNavigate(`/blog/${rel.slug}`)}
                      className="cursor-pointer group space-y-1"
                    >
                      <span className="text-[11px] text-stone-500 font-sans">
                        {rel.categories?.[0]?.name} · {rel.readingTime} min
                      </span>
                      <h5 className="text-xs font-semibold text-stone-800 group-hover:text-amber-900 transition-colors line-clamp-2">
                        {rel.title}
                      </h5>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Back to catalog link */}
      <div className="mt-16 pt-8 border-t border-stone-200 flex items-center justify-between">
        <button
          onClick={() => onNavigate('/blog')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-700 hover:text-stone-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Publications</span>
        </button>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-xs font-medium text-stone-500 hover:text-stone-900 underline"
        >
          Back to top
        </button>
      </div>
    </article>
  );
};
