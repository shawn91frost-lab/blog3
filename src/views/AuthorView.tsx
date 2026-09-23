import React from 'react';
import { storage } from '../lib/storage';
import { PostCard } from '../components/PostCard';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SEOHead } from '../components/SEOHead';
import { Twitter, Github, Linkedin, Globe, ArrowLeft } from 'lucide-react';

interface AuthorViewProps {
  slug: string;
  onNavigate: (route: string) => void;
}

export const AuthorView: React.FC<AuthorViewProps> = ({ slug, onNavigate }) => {
  const author = storage.getAuthorBySlug(slug);
  const postsResult = storage.getPosts({ authorSlug: slug, status: 'published', limit: 20 });
  const posts = postsResult.posts;

  if (!author) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold font-editorial text-stone-900">Author Not Found</h2>
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
    <div className="space-y-10">
      <SEOHead
        title={`${author.name} — Author Profile | NexusBlog`}
        description={author.bio}
      />

      <Breadcrumbs
        items={[{ label: 'Articles', url: '/blog' }, { label: author.name }]}
        onNavigate={onNavigate}
      />

      {/* Author Profile Header */}
      <div className="p-8 sm:p-10 bg-[#f7f5f0] border border-stone-200 rounded-2xl flex flex-col md:flex-row items-start gap-8">
        <img
          src={author.avatar}
          alt={author.name}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-stone-300 shadow-sm shrink-0"
          referrerPolicy="no-referrer"
        />

        <div className="space-y-4 flex-1">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-editorial text-stone-950 mb-1">
              {author.name}
            </h1>
            <p className="text-sm font-medium text-stone-700">
              {author.jobTitle} <span className="text-stone-400">·</span> {author.company}
            </p>
          </div>

          <p className="text-sm text-stone-600 leading-relaxed max-w-3xl">
            {author.bio}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-stone-200/80 text-xs text-stone-500">
            <span className="font-mono">{author.articleCount} published {author.articleCount === 1 ? 'publication' : 'publications'}</span>

            {author.socialLinks?.twitter && (
              <a
                href={author.socialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="hover:text-stone-900 transition-colors flex items-center gap-1"
              >
                <Twitter className="w-3.5 h-3.5" />
                <span>Twitter</span>
              </a>
            )}

            {author.socialLinks?.github && (
              <a
                href={author.socialLinks.github}
                target="_blank"
                rel="noreferrer"
                className="hover:text-stone-900 transition-colors flex items-center gap-1"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
            )}

            {author.socialLinks?.linkedin && (
              <a
                href={author.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="hover:text-stone-900 transition-colors flex items-center gap-1"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </a>
            )}

            {author.socialLinks?.website && (
              <a
                href={author.socialLinks.website}
                target="_blank"
                rel="noreferrer"
                className="hover:text-stone-900 transition-colors flex items-center gap-1"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Website</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Author Publications Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold font-editorial text-stone-900 border-b border-stone-200 pb-3">
          Articles by {author.name}
        </h2>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onNavigate={onNavigate} />
            ))}
          </div>
        ) : (
          <p className="text-stone-500 text-sm">No published articles under this author profile yet.</p>
        )}
      </div>

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
