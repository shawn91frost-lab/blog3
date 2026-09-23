import React, { useState } from 'react';
import { storage } from '../lib/storage';
import { Post, Category, Tag, Author, Comment, NewsletterSubscriber, Redirect, Media, SiteSettings, PostStatus } from '../types/blog';
import {
  Sliders,
  FileText,
  FolderTree,
  Tag as TagIcon,
  MessageSquare,
  Users,
  Image as ImageIcon,
  ArrowLeftRight,
  UploadCloud,
  Settings,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Search,
  Check,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface AdminViewProps {
  onNavigate: (route: string) => void;
}

type AdminTab =
  | 'dashboard'
  | 'posts'
  | 'categories'
  | 'tags'
  | 'comments'
  | 'subscribers'
  | 'media'
  | 'redirects'
  | 'migration'
  | 'settings';

export const AdminView: React.FC<AdminViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  // Data snapshots
  const posts = storage.getPosts({ status: 'all', limit: 100 }).posts;
  const categories = storage.getCategories();
  const tags = storage.getTags();
  const authors = storage.getAuthors();
  const comments = storage.getComments(undefined, 'all');
  const subscribers = storage.getSubscribers();
  const media = storage.getMedia();
  const redirects = storage.getRedirects();
  const settings = storage.getSettings();

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  // Post editor modal state
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);
  const [postSearch, setPostSearch] = useState('');

  // Migration state
  const [migrationLogs, setMigrationLogs] = useState<string[]>([]);
  const [migrationRunning, setMigrationRunning] = useState(false);
  const [customWpData, setCustomWpData] = useState('');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // New Category / Tag state
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const [newTagName, setNewTagName] = useState('');
  const [newTagSlug, setNewTagSlug] = useState('');

  // New Redirect state
  const [newRedSource, setNewRedSource] = useState('');
  const [newRedDest, setNewRedDest] = useState('');

  // Stats
  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const scheduledCount = posts.filter((p) => p.status === 'scheduled').length;
  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);
  const pendingCommentsCount = comments.filter((c) => c.status === 'pending').length;

  // Handler: Save Post
  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !editingPost.title) return;

    storage.savePost({
      id: editingPost.id,
      title: editingPost.title,
      slug: editingPost.slug,
      excerpt: editingPost.excerpt || '',
      content: editingPost.content || [{ id: 'b1', type: 'paragraph', content: editingPost.excerpt || '' }],
      authorId: editingPost.authorId || authors[0]?.id || 'author-sarah',
      categoryIds: editingPost.categoryIds && editingPost.categoryIds.length > 0 ? editingPost.categoryIds : [categories[0]?.id || 'cat-technology'],
      tagIds: editingPost.tagIds || [],
      status: editingPost.status || 'draft',
      publishedAt: editingPost.status === 'published' ? (editingPost.publishedAt || new Date().toISOString()) : editingPost.publishedAt,
      scheduledAt: editingPost.scheduledAt || null,
      featured: editingPost.featured ?? false,
      allowComments: editingPost.allowComments ?? true,
      featuredImage: editingPost.featuredImage || '/src/assets/images/hero_nestjs_architecture_1790181779835.jpg',
      featuredImageCaption: editingPost.featuredImageCaption,
      seo: editingPost.seo || {
        title: `${editingPost.title} | NexusBlog`,
        description: editingPost.excerpt || '',
      },
    });

    setEditingPost(null);
    triggerRefresh();
  };

  // Handler: Run WordPress Migration
  const handleRunMigration = () => {
    setMigrationRunning(true);
    setMigrationLogs(['Connecting to WordPress export parser...']);

    setTimeout(() => {
      let payloadToImport: any;

      if (customWpData.trim()) {
        try {
          payloadToImport = JSON.parse(customWpData);
        } catch (err: any) {
          setMigrationLogs((prev) => [...prev, `Error parsing custom JSON: ${err.message}`]);
          setMigrationRunning(false);
          return;
        }
      } else {
        // Built-in realistic WordPress migration payload
        payloadToImport = {
          posts: [
            {
              title: 'Migrated: 10 Essential Node.js Memory Leak Debugging Strategies',
              slug: 'migrated-nodejs-memory-leak-debugging',
              oldUrl: '/2023/11/essential-nodejs-memory-leaks/',
              excerpt: 'How we resolved production memory leaks using heap snapshots, V8 sampling profiler, and clinic.js.',
              content: 'Full article migrated from legacy WordPress engine. Permalinks were automatically mapped to 301 permanent redirects in Supabase.',
              date: '2025-11-20T10:00:00.000Z',
              featuredImage: '/src/assets/images/article_postgres_tuning_1790181792193.jpg',
            },
            {
              title: 'Migrated: Building Micro-Frontends with Module Federation',
              slug: 'migrated-building-micro-frontends-module-federation',
              oldUrl: '/2023/12/micro-frontends-module-federation/',
              excerpt: 'Architectural breakdown of sharing state and runtime dependencies across disparate frontend applications.',
              content: 'Preserving decades of WordPress PageRank through seamless 301 status code mapping.',
              date: '2025-12-05T14:30:00.000Z',
              featuredImage: '/src/assets/images/article_payload_cms_1790181815671.jpg',
            },
          ],
        };
      }

      const res = storage.importFromWordPress(payloadToImport);
      setMigrationLogs(res.log);
      setMigrationRunning(false);
      triggerRefresh();
    }, 600);
  };

  // Handler: Export CSV
  const handleExportSubscribersCsv = () => {
    const headers = 'ID,Email,Name,Status,SubscribedAt,Source\n';
    const rows = subscribers
      .map((s) => `"${s.id}","${s.email}","${s.name || ''}","${s.status}","${s.subscribedAt}","${s.source}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nexusblog_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#f7f6f2] min-h-[85vh] rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden flex flex-col md:flex-row">
      
      {/* CMS Studio Navigation Sidebar */}
      <aside className="w-full md:w-64 bg-stone-900 text-stone-300 p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-stone-800">
            <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-editorial tracking-wide">
                Payload CMS
              </h2>
              <span className="text-[10px] text-stone-400 font-mono">v3.0 Production</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-stone-500 px-3 block mb-1">
              General
            </span>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${
                activeTab === 'dashboard' ? 'bg-stone-800 text-white font-semibold' : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Overview Dashboard</span>
            </button>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-stone-500 px-3 block mb-1">
              Collections
            </span>
            {[
              { id: 'posts', label: 'Posts', icon: FileText, count: posts.length },
              { id: 'categories', label: 'Categories', icon: FolderTree, count: categories.length },
              { id: 'tags', label: 'Tags', icon: TagIcon, count: tags.length },
              { id: 'comments', label: 'Comments', icon: MessageSquare, badge: pendingCommentsCount },
              { id: 'subscribers', label: 'Subscribers', icon: Users, count: subscribers.length },
              { id: 'media', label: 'Media Library', icon: ImageIcon, count: media.length },
              { id: 'redirects', label: '301 Redirects', icon: ArrowLeftRight, count: redirects.length },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                    activeTab === item.id ? 'bg-stone-800 text-white font-semibold' : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="px-1.5 py-0.5 text-[10px] bg-amber-500 text-stone-950 font-bold rounded-full">
                      {item.badge}
                    </span>
                  ) : item.count !== undefined ? (
                    <span className="text-[10px] text-stone-500 font-mono">{item.count}</span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-stone-500 px-3 block mb-1">
              Tools & Globals
            </span>
            <button
              onClick={() => setActiveTab('migration')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${
                activeTab === 'migration' ? 'bg-stone-800 text-amber-400 font-semibold' : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>WordPress Migration</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${
                activeTab === 'settings' ? 'bg-stone-800 text-white font-semibold' : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Site Globals & Settings</span>
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-800 text-xs text-stone-500 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-stone-400 font-mono text-[11px]">Supabase DB Connected</span>
          </div>
          <button
            onClick={() => onNavigate('/')}
            className="text-stone-400 hover:text-white text-xs flex items-center gap-1"
          >
            <span>View Public Site</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 p-6 sm:p-8 md:p-10 overflow-y-auto">
        
        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
              <div>
                <h1 className="text-2xl font-bold font-editorial text-stone-950">
                  Editorial Command Center
                </h1>
                <p className="text-xs text-stone-500 mt-1">
                  Live status of PostgreSQL collections, subscriber growth, and moderation queues.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingPost({
                    title: '',
                    slug: '',
                    excerpt: '',
                    status: 'draft',
                    categoryIds: [categories[0]?.id || 'cat-technology'],
                    tagIds: [tags[0]?.id || 'tag-typescript'],
                    authorId: authors[0]?.id || 'author-sarah',
                    content: [{ id: 'b1', type: 'paragraph', content: '' }],
                  });
                  setActiveTab('posts');
                }}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Compose Publication</span>
              </button>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-sm space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 font-sans">
                  Published Articles
                </span>
                <div className="text-2xl font-bold font-mono text-stone-900">{publishedCount}</div>
                <div className="text-[11px] text-stone-500">
                  {draftCount} drafts · {scheduledCount} scheduled
                </div>
              </div>

              <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-sm space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 font-sans">
                  Total Reader Views
                </span>
                <div className="text-2xl font-bold font-mono text-amber-900">{totalViews.toLocaleString()}</div>
                <div className="text-[11px] text-stone-500">Across all catalog publications</div>
              </div>

              <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-sm space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 font-sans">
                  Active Subscribers
                </span>
                <div className="text-2xl font-bold font-mono text-stone-900">{subscribers.length}</div>
                <div className="text-[11px] text-emerald-600 font-medium">+100% verified emails</div>
              </div>

              <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-sm space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 font-sans">
                  Pending Comments
                </span>
                <div className="text-2xl font-bold font-mono text-stone-900">{pendingCommentsCount}</div>
                <button
                  onClick={() => setActiveTab('comments')}
                  className="text-[11px] text-amber-900 hover:underline font-medium"
                >
                  Review moderation queue →
                </button>
              </div>
            </div>

            {/* Quick Actions & Recent Posts Table */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold font-editorial text-stone-900">
                  Recent Publications & Drafts
                </h3>
                <button
                  onClick={() => setActiveTab('posts')}
                  className="text-xs text-stone-600 hover:text-stone-950 underline"
                >
                  View all ({posts.length})
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-[#faf9f6] text-stone-500 uppercase tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="px-4 py-2.5">Title</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Author</th>
                      <th className="px-4 py-2.5">Views</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {posts.slice(0, 5).map((post) => (
                      <tr key={post.id} className="hover:bg-stone-50">
                        <td className="px-4 py-3 font-medium text-stone-900 max-w-xs truncate">
                          {post.title}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              post.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : post.status === 'scheduled'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-stone-600">{post.author?.name || 'Staff'}</td>
                        <td className="px-4 py-3 font-mono">{post.views.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingPost(post);
                              setActiveTab('posts');
                            }}
                            className="text-stone-600 hover:text-stone-900 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onNavigate(`/blog/${post.slug}`)}
                            className="text-amber-900 hover:underline font-medium"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: POSTS COLLECTION */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
              <div>
                <h1 className="text-2xl font-bold font-editorial text-stone-950">
                  Posts Collection
                </h1>
                <p className="text-xs text-stone-500 mt-1">
                  Manage articles, draft releases, scheduled publications, and rich content blocks.
                </p>
              </div>
              <button
                onClick={() =>
                  setEditingPost({
                    title: '',
                    slug: '',
                    excerpt: '',
                    status: 'draft',
                    categoryIds: [categories[0]?.id || 'cat-technology'],
                    tagIds: [tags[0]?.id || 'tag-typescript'],
                    authorId: authors[0]?.id || 'author-sarah',
                    content: [{ id: 'b1', type: 'paragraph', content: '' }],
                  })
                }
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Post</span>
              </button>
            </div>

            {/* If currently editing a post, show the Full Post Editor */}
            {editingPost ? (
              <form onSubmit={handleSavePost} className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                  <h3 className="text-lg font-bold font-editorial text-stone-900">
                    {editingPost.id ? 'Edit Publication' : 'New Publication Draft'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingPost(null)}
                    className="text-xs text-stone-500 hover:text-stone-800"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingPost.title || ''}
                        onChange={(e) => {
                          const title = e.target.value;
                          const autoSlug = title
                            .toLowerCase()
                            .trim()
                            .replace(/[^\w\s-]/g, '')
                            .replace(/[\s_-]+/g, '-')
                            .replace(/^-+|-+$/g, '');
                          setEditingPost({ ...editingPost, title, slug: editingPost.slug ? editingPost.slug : autoSlug });
                        }}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#faf9f6] border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 font-editorial font-bold text-lg"
                        placeholder="e.g. Distributed Consensus in PostgreSQL Clusters"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Slug (URL identifier) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingPost.slug || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-[#faf9f6] border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 font-mono"
                        placeholder="distributed-consensus-postgresql-clusters"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Excerpt / Standfirst <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={editingPost.excerpt || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-[#faf9f6] border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 leading-relaxed"
                        placeholder="Concise 2-sentence summary for search indexes and lead cards..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Featured Image URL
                      </label>
                      <input
                        type="text"
                        value={editingPost.featuredImage || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, featuredImage: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-[#faf9f6] border border-stone-300 rounded-xl font-mono text-stone-600"
                        placeholder="/src/assets/images/hero_nestjs_architecture_1790181779835.jpg"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Author
                      </label>
                      <select
                        value={editingPost.authorId || authors[0]?.id}
                        onChange={(e) => setEditingPost({ ...editingPost, authorId: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-[#faf9f6] border border-stone-300 rounded-xl"
                      >
                        {authors.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.jobTitle})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Publishing Status
                      </label>
                      <select
                        value={editingPost.status || 'draft'}
                        onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as PostStatus })}
                        className="w-full px-3 py-2 text-xs bg-[#faf9f6] border border-stone-300 rounded-xl font-semibold"
                      >
                        <option value="draft">Draft (Private)</option>
                        <option value="published">Published (Live)</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Primary Category
                      </label>
                      <select
                        value={editingPost.categoryIds?.[0] || categories[0]?.id}
                        onChange={(e) => setEditingPost({ ...editingPost, categoryIds: [e.target.value] })}
                        className="w-full px-3 py-2 text-xs bg-[#faf9f6] border border-stone-300 rounded-xl"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-2 flex items-center gap-6">
                      <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingPost.featured ?? false}
                          onChange={(e) => setEditingPost({ ...editingPost, featured: e.target.checked })}
                          className="rounded text-stone-900"
                        />
                        <span className="font-semibold">Featured on Homepage</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingPost.allowComments ?? true}
                          onChange={(e) => setEditingPost({ ...editingPost, allowComments: e.target.checked })}
                          className="rounded text-stone-900"
                        />
                        <span>Allow Comments</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Content Block Editor */}
                <div className="border-t border-stone-200 pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold font-editorial text-stone-900">
                      Article Content Blocks ({editingPost.content?.length || 0})
                    </h4>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          const blocks = [...(editingPost.content || [])];
                          blocks.push({ id: `b-${Date.now()}`, type: 'paragraph', content: '' });
                          setEditingPost({ ...editingPost, content: blocks });
                        }}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg"
                      >
                        + Paragraph
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const blocks = [...(editingPost.content || [])];
                          blocks.push({ id: `b-${Date.now()}`, type: 'heading', level: 2, content: '' });
                          setEditingPost({ ...editingPost, content: blocks });
                        }}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg"
                      >
                        + Heading 2
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const blocks = [...(editingPost.content || [])];
                          blocks.push({ id: `b-${Date.now()}`, type: 'code', language: 'typescript', content: '' });
                          setEditingPost({ ...editingPost, content: blocks });
                        }}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg"
                      >
                        + Code Block
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const blocks = [...(editingPost.content || [])];
                          blocks.push({ id: `b-${Date.now()}`, type: 'callout', calloutType: 'tip', content: '' });
                          setEditingPost({ ...editingPost, content: blocks });
                        }}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg"
                      >
                        + Callout
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(editingPost.content || []).map((b, idx) => (
                      <div key={b.id || idx} className="p-3 bg-[#faf9f6] border border-stone-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                          <span className="uppercase font-bold">{b.type} {b.level ? `(H${b.level})` : ''}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const blocks = [...(editingPost.content || [])];
                              blocks.splice(idx, 1);
                              setEditingPost({ ...editingPost, content: blocks });
                            }}
                            className="text-rose-600 hover:text-rose-800"
                          >
                            Remove
                          </button>
                        </div>
                        <textarea
                          rows={b.type === 'code' ? 5 : 3}
                          value={b.content || ''}
                          onChange={(e) => {
                            const blocks = [...(editingPost.content || [])];
                            blocks[idx] = { ...blocks[idx], content: e.target.value };
                            setEditingPost({ ...editingPost, content: blocks });
                          }}
                          className={`w-full p-2.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 ${
                            b.type === 'code' ? 'font-mono bg-stone-900 text-stone-100' : ''
                          }`}
                          placeholder={`Enter ${b.type} content...`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingPost(null)}
                    className="px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-sm"
                  >
                    Save & Persist in Database
                  </button>
                </div>
              </form>
            ) : (
              /* Posts Table */
              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-stone-200 flex items-center justify-between">
                  <div className="relative w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={postSearch}
                      onChange={(e) => setPostSearch(e.target.value)}
                      placeholder="Filter posts..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                    />
                  </div>
                  <span className="text-xs text-stone-400 font-mono">
                    Total: {posts.length} articles
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-700">
                    <thead className="bg-[#faf9f6] text-stone-500 uppercase tracking-wider border-b border-stone-200">
                      <tr>
                        <th className="px-5 py-3">Article Title</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Author</th>
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">Views</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {posts
                        .filter((p) => p.title.toLowerCase().includes(postSearch.toLowerCase()))
                        .map((post) => (
                          <tr key={post.id} className="hover:bg-stone-50/70">
                            <td className="px-5 py-3.5">
                              <div className="font-semibold text-stone-900 max-w-sm truncate">
                                {post.title}
                              </div>
                              <div className="text-[11px] text-stone-400 font-mono">/blog/{post.slug}</div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                  post.status === 'published'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : post.status === 'scheduled'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-stone-200 text-stone-700'
                                }`}
                              >
                                {post.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-stone-600">{post.author?.name || 'Staff'}</td>
                            <td className="px-5 py-3.5 text-stone-500 font-mono text-[11px]">
                              {post.publishedAt ? post.publishedAt.slice(0, 10) : 'Draft'}
                            </td>
                            <td className="px-5 py-3.5 font-mono text-stone-600">{post.views.toLocaleString()}</td>
                            <td className="px-5 py-3.5 text-right space-x-3">
                              <button
                                onClick={() => setEditingPost(post)}
                                className="text-stone-700 hover:text-stone-950 font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => onNavigate(`/blog/${post.slug}`)}
                                className="text-amber-900 hover:underline font-medium"
                              >
                                View
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete publication "${post.title}"?`)) {
                                    storage.deletePost(post.id);
                                    triggerRefresh();
                                  }
                                }}
                                className="text-rose-600 hover:text-rose-800 font-medium"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="border-b border-stone-200 pb-5">
              <h1 className="text-2xl font-bold font-editorial text-stone-950">Categories Collection</h1>
              <p className="text-xs text-stone-500 mt-1">Hierarchical technical taxonomy management.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 border border-stone-200 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-sm font-bold font-editorial text-stone-900">Add New Category</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-stone-600 mb-1">Name</label>
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => {
                        setNewCatName(e.target.value);
                        if (!newCatSlug) setNewCatSlug(e.target.value.toLowerCase().replace(/[\s_]+/g, '-'));
                      }}
                      placeholder="e.g. Distributed Systems"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-600 mb-1">Slug</label>
                    <input
                      type="text"
                      value={newCatSlug}
                      onChange={(e) => setNewCatSlug(e.target.value)}
                      placeholder="distributed-systems"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-600 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      placeholder="Brief domain summary..."
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!newCatName) return;
                      storage.saveCategory({ name: newCatName, slug: newCatSlug || newCatName.toLowerCase(), description: newCatDesc });
                      setNewCatName('');
                      setNewCatSlug('');
                      setNewCatDesc('');
                      triggerRefresh();
                    }}
                    className="w-full py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold"
                  >
                    Save Category
                  </button>
                </div>
              </div>

              <div className="md:col-span-2 bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-[#faf9f6] text-stone-500 uppercase tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="px-4 py-3">Category Name</th>
                      <th className="px-4 py-3">Slug</th>
                      <th className="px-4 py-3">Articles</th>
                      <th className="px-4 py-3 text-right">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {categories.map((c) => (
                      <tr key={c.id}>
                        <td className="px-4 py-3 font-semibold text-stone-900">{c.name}</td>
                        <td className="px-4 py-3 font-mono text-stone-500">{c.slug}</td>
                        <td className="px-4 py-3 font-mono">{c.postCount || 0}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => onNavigate(`/category/${c.slug}`)}
                            className="text-amber-900 hover:underline"
                          >
                            Browse
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COMMENTS MODERATION */}
        {activeTab === 'comments' && (
          <div className="space-y-6">
            <div className="border-b border-stone-200 pb-5">
              <h1 className="text-2xl font-bold font-editorial text-stone-950">
                Comments Moderation Queue
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Moderate reader feedback, approve comments, or mark unsolicited spam.
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-[#faf9f6] text-stone-500 uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-3">Author</th>
                    <th className="px-4 py-3">Comment Content</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {comments.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-stone-900">{c.name}</div>
                        <div className="text-[11px] text-stone-400">{c.email}</div>
                      </td>
                      <td className="px-4 py-3 max-w-sm">
                        <p className="line-clamp-2 text-stone-700">{c.comment}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            c.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.status === 'spam'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-stone-400">
                        {c.createdAt.slice(0, 10)}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {c.status !== 'approved' && (
                          <button
                            onClick={() => {
                              storage.updateCommentStatus(c.id, 'approved');
                              triggerRefresh();
                            }}
                            className="text-emerald-700 hover:text-emerald-900 font-semibold"
                          >
                            Approve
                          </button>
                        )}
                        {c.status !== 'spam' && (
                          <button
                            onClick={() => {
                              storage.updateCommentStatus(c.id, 'spam');
                              triggerRefresh();
                            }}
                            className="text-rose-600 hover:text-rose-800 font-medium"
                          >
                            Spam
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: NEWSLETTER SUBSCRIBERS */}
        {activeTab === 'subscribers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-5">
              <div>
                <h1 className="text-2xl font-bold font-editorial text-stone-950">
                  Newsletter Subscribers ({subscribers.length})
                </h1>
                <p className="text-xs text-stone-500 mt-1">
                  Active subscribers receiving the bi-weekly Engineering Dispatch.
                </p>
              </div>
              <button
                onClick={handleExportSubscribersCsv}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-[#faf9f6] text-stone-500 uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="px-5 py-3">Subscriber Email</th>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Source Channel</th>
                    <th className="px-5 py-3">Date Subscribed</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {subscribers.map((sub) => (
                    <tr key={sub.id}>
                      <td className="px-5 py-3.5 font-medium text-stone-900">{sub.email}</td>
                      <td className="px-5 py-3.5 text-stone-600">{sub.name || '—'}</td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-stone-500">{sub.source}</td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-stone-400">
                        {sub.subscribedAt.slice(0, 10)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800">
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: 301 REDIRECTS REGISTRY */}
        {activeTab === 'redirects' && (
          <div className="space-y-6">
            <div className="border-b border-stone-200 pb-5">
              <h1 className="text-2xl font-bold font-editorial text-stone-950">
                301 Permanent Redirects Registry
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Preserves incoming WordPress backlinks and SEO PageRank through instant HTTP 301 mapping.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 border border-stone-200 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-sm font-bold font-editorial text-stone-900">Add 301 Redirect Rule</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-stone-600 mb-1">Old WordPress URL Path</label>
                    <input
                      type="text"
                      value={newRedSource}
                      onChange={(e) => setNewRedSource(e.target.value)}
                      placeholder="/2024/05/old-article-slug/"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-600 mb-1">New Destination Path</label>
                    <input
                      type="text"
                      value={newRedDest}
                      onChange={(e) => setNewRedDest(e.target.value)}
                      placeholder="/blog/new-article-slug"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg font-mono"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!newRedSource || !newRedDest) return;
                      storage.saveRedirect({ source: newRedSource, destination: newRedDest, statusCode: 301 });
                      setNewRedSource('');
                      setNewRedDest('');
                      triggerRefresh();
                    }}
                    className="w-full py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold"
                  >
                    Activate Redirect Rule
                  </button>
                </div>
              </div>

              <div className="md:col-span-2 bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-[#faf9f6] text-stone-500 uppercase tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="px-4 py-3">Legacy URL (Source)</th>
                      <th className="px-4 py-3">Canonical Destination</th>
                      <th className="px-4 py-3">Hits</th>
                      <th className="px-4 py-3 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {redirects.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 font-mono text-amber-900 text-[11px]">{r.source}</td>
                        <td className="px-4 py-3 font-mono text-stone-800 text-[11px]">{r.destination}</td>
                        <td className="px-4 py-3 font-mono">{r.hitCount || 0}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              storage.deleteRedirect(r.id);
                              triggerRefresh();
                            }}
                            className="text-rose-600 hover:text-rose-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: WORDPRESS MIGRATION SUITE */}
        {activeTab === 'migration' && (
          <div className="space-y-6">
            <div className="border-b border-stone-200 pb-5">
              <h1 className="text-2xl font-bold font-editorial text-stone-950">
                WordPress Migration Pipeline
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Migrate legacy WordPress articles, map permalink structures to 301 redirects, and import media into Supabase.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 bg-white p-6 border border-stone-200 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-base font-bold font-editorial text-stone-900">
                  Execute WordPress Import
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  This tool imports posts, extracts metadata, recalculates reading times, and automatically registers 301 redirects to ensure seamless PageRank preservation.
                </p>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-stone-700">
                    Custom WXR / JSON Payload (Optional - leave empty for realistic production seed import)
                  </label>
                  <textarea
                    rows={6}
                    value={customWpData}
                    onChange={(e) => setCustomWpData(e.target.value)}
                    placeholder='{"posts": [{"title": "Legacy Post", "slug": "legacy-post", "oldUrl": "/2023/10/legacy-post/", "content": "..."}]}'
                    className="w-full p-3 text-xs bg-[#faf9f6] border border-stone-300 rounded-xl font-mono"
                  />
                </div>

                <button
                  onClick={handleRunMigration}
                  disabled={migrationRunning}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${migrationRunning ? 'animate-spin' : ''}`} />
                  <span>{migrationRunning ? 'Executing Migration Pipeline...' : 'Run WordPress Migration'}</span>
                </button>
              </div>

              <div className="lg:col-span-6 bg-stone-900 text-stone-200 p-6 rounded-2xl border border-stone-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2 text-stone-400">
                  <span>Migration Execution Logs</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <div className="h-64 overflow-y-auto space-y-1.5 text-[11px] leading-relaxed">
                  {migrationLogs.length === 0 ? (
                    <p className="text-stone-500 italic">
                      Click "Run WordPress Migration" to start parsing and mapping records.
                    </p>
                  ) : (
                    migrationLogs.map((log, lIdx) => (
                      <div key={lIdx} className="text-stone-300">
                        <span className="text-amber-400 mr-2">›</span>
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: SITE SETTINGS / GLOBALS */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="border-b border-stone-200 pb-5 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold font-editorial text-stone-950">
                  Site Settings & Globals
                </h1>
                <p className="text-xs text-stone-500 mt-1">
                  Configure site-wide brand identity, SEO defaults, analytics, and contact information.
                </p>
              </div>
              {settingsSaved && (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Changes saved!
                </span>
              )}
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm max-w-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Site Brand Name</label>
                  <input
                    type="text"
                    value={settingsForm.siteName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Canonical Base URL</label>
                  <input
                    type="text"
                    value={settingsForm.siteUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, siteUrl: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Editorial Description</label>
                <textarea
                  rows={2}
                  value={settingsForm.siteDescription}
                  onChange={(e) => setSettingsForm({ ...settingsForm, siteDescription: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Copyright Notice</label>
                <input
                  type="text"
                  value={settingsForm.copyrightText}
                  onChange={(e) => setSettingsForm({ ...settingsForm, copyrightText: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    storage.updateSettings(settingsForm);
                    setSettingsSaved(true);
                    setTimeout(() => setSettingsSaved(false), 3000);
                    triggerRefresh();
                  }}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Save Global Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: MEDIA LIBRARY */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="border-b border-stone-200 pb-5">
              <h1 className="text-2xl font-bold font-editorial text-stone-950">
                Media & Storage Library
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Optimized images stored in Supabase Storage with responsive WebP derivatives.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {media.map((item) => (
                <div key={item.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm group">
                  <div className="aspect-video bg-stone-100 overflow-hidden">
                    <img
                      src={item.url}
                      alt={item.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-3 text-[11px] space-y-1">
                    <p className="font-semibold text-stone-900 truncate">{item.filename}</p>
                    <p className="text-stone-400 font-mono">{(item.filesize / 1024).toFixed(1)} KB · {item.width}x{item.height}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 10: TAGS */}
        {activeTab === 'tags' && (
          <div className="space-y-6">
            <div className="border-b border-stone-200 pb-5">
              <h1 className="text-2xl font-bold font-editorial text-stone-950">Tags Collection</h1>
              <p className="text-xs text-stone-500 mt-1">Faceted topic keywords for article cross-referencing.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 border border-stone-200 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-sm font-bold font-editorial text-stone-900">Add New Tag</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-stone-600 mb-1">Tag Name</label>
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => {
                        setNewTagName(e.target.value);
                        if (!newTagSlug) setNewTagSlug(e.target.value.toLowerCase().replace(/[\s_]+/g, '-'));
                      }}
                      placeholder="e.g. pgvector"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-600 mb-1">Tag Slug</label>
                    <input
                      type="text"
                      value={newTagSlug}
                      onChange={(e) => setNewTagSlug(e.target.value)}
                      placeholder="pgvector"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg font-mono"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!newTagName) return;
                      storage.saveTag({ name: newTagName, slug: newTagSlug || newTagName.toLowerCase() });
                      setNewTagName('');
                      setNewTagSlug('');
                      triggerRefresh();
                    }}
                    className="w-full py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold"
                  >
                    Save Tag
                  </button>
                </div>
              </div>

              <div className="md:col-span-2 bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-[#faf9f6] text-stone-500 uppercase tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="px-4 py-3">Tag</th>
                      <th className="px-4 py-3">Slug</th>
                      <th className="px-4 py-3">Article Count</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {tags.map((t) => (
                      <tr key={t.id}>
                        <td className="px-4 py-3 font-semibold text-stone-900">#{t.name}</td>
                        <td className="px-4 py-3 font-mono text-stone-500">{t.slug}</td>
                        <td className="px-4 py-3 font-mono">{t.postCount || 0}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => onNavigate(`/tag/${t.slug}`)}
                            className="text-amber-900 hover:underline"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
