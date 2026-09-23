import React from 'react';
import { Post, Category, Author, SiteSettings } from '../types/blog';
import { FeaturedHero } from '../components/FeaturedHero';
import { PostCard } from '../components/PostCard';
import { NewsletterForm } from '../components/NewsletterForm';
import { SEOHead } from '../components/SEOHead';
import { ArrowRight, Sparkles, BookOpen, Users, Compass, Layers } from 'lucide-react';

interface HomeViewProps {
  posts: Post[];
  categories: Category[];
  authors: Author[];
  settings: SiteSettings;
  onNavigate: (route: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  posts,
  categories,
  authors,
  settings,
  onNavigate,
}) => {
  const featuredPost = posts.find((p) => p.featured) || posts[0];
  const secondaryLeadPosts = posts.filter((p) => p.id !== featuredPost?.id).slice(0, 3);
  const recentPosts = posts.filter((p) => p.id !== featuredPost?.id && !secondaryLeadPosts.some((s) => s.id === p.id)).slice(0, 6);

  return (
    <div>
      <SEOHead
        title={`${settings.siteName} | Enterprise Architecture & Database Journal`}
        description={settings.siteDescription}
        canonicalUrl={settings.siteUrl}
      />

      {/* Featured Lead Publication */}
      {featuredPost && (
        <FeaturedHero post={featuredPost} onNavigate={onNavigate} />
      )}

      {/* Secondary Lead Row */}
      {secondaryLeadPosts.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-900" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 font-sans">
                Curated Architecture Studies
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/blog')}
              className="text-xs font-semibold text-stone-600 hover:text-stone-950 flex items-center gap-1 transition-colors"
            >
              <span>Explore full catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {secondaryLeadPosts.map((post) => (
              <PostCard key={post.id} post={post} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* Core Technology Domains / Categories */}
      <section className="mb-16 py-10 px-6 sm:px-8 bg-[#f5f4f0] border border-stone-200/90 rounded-2xl">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-stone-300/70">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 font-sans block mb-1">
              Domain Specialization
            </span>
            <h2 className="text-2xl font-bold font-editorial text-stone-950">
              Explore by Technical Discipline
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/blog')}
            className="hidden sm:flex text-xs font-semibold text-stone-700 hover:text-stone-950 items-center gap-1"
          >
            <span>All categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate(`/category/${cat.slug}`)}
              className="group cursor-pointer p-5 bg-white border border-stone-200 rounded-xl hover:border-stone-400 hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold font-editorial text-stone-900 group-hover:text-amber-900 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-xs font-mono text-stone-500 tabular-nums">
                    {cat.postCount || 0} {cat.postCount === 1 ? 'article' : 'articles'}
                  </span>
                </div>
                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
              <div className="text-[11px] font-medium text-stone-500 group-hover:text-stone-900 flex items-center gap-1">
                <span>View collection</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Dispatches Grid */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-stone-700" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 font-sans">
              Recent Engineering Dispatches
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/blog')}
            className="text-xs font-semibold text-stone-600 hover:text-stone-950 flex items-center gap-1 transition-colors"
          >
            <span>View all articles ({posts.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentPosts.map((post) => (
            <PostCard key={post.id} post={post} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* Author Collective Spotlight */}
      <section className="mb-16 border-t border-stone-200 pt-12">
        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-stone-200">
          <Users className="w-4 h-4 text-stone-700" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 font-sans">
            Staff Architects & Engineering Contributors
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {authors.slice(0, 3).map((author) => (
            <div
              key={author.id}
              onClick={() => onNavigate(`/author/${author.slug}`)}
              className="group cursor-pointer p-6 bg-white border border-stone-200 rounded-2xl hover:border-stone-300 hover:shadow-sm transition-all space-y-4"
            >
              <div className="flex items-center gap-3.5">
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="w-12 h-12 rounded-full object-cover border border-stone-200 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-base font-bold text-stone-900 group-hover:text-amber-900 font-editorial transition-colors">
                    {author.name}
                  </h3>
                  <p className="text-xs text-stone-500">{author.jobTitle}</p>
                  <p className="text-[11px] text-stone-400">{author.company}</p>
                </div>
              </div>
              <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                {author.bio}
              </p>
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span>{author.articleCount} published {author.articleCount === 1 ? 'article' : 'articles'}</span>
                <span className="font-semibold text-stone-800 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Profile <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Dispatch Component */}
      <NewsletterForm source="homepage_main" />
    </div>
  );
};
