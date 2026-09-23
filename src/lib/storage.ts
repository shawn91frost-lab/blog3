/**
 * NexusBlog Enterprise Data & Storage Engine
 * Simulates and interfaces with Supabase PostgreSQL and Payload CMS repository layers
 * Provides real-time persistence in localStorage with fallback to rich seed database.
 */

import {
  Author,
  Category,
  Comment,
  Media,
  NewsletterSubscriber,
  Page,
  Post,
  PostStatus,
  Redirect,
  SiteSettings,
  Tag,
  User,
} from '../types/blog';
import {
  SEED_AUTHORS,
  SEED_CATEGORIES,
  SEED_COMMENTS,
  SEED_NEWSLETTER_SUBSCRIBERS,
  SEED_PAGES,
  SEED_POSTS,
  SEED_REDIRECTS,
  SEED_SITE_SETTINGS,
  SEED_TAGS,
} from '../data/seedData';

const STORAGE_KEY = 'nexusblog_database_v1';

export interface DatabaseState {
  posts: Post[];
  categories: Category[];
  tags: Tag[];
  authors: Author[];
  comments: Comment[];
  subscribers: NewsletterSubscriber[];
  pages: Page[];
  redirects: Redirect[];
  media: Media[];
  settings: SiteSettings;
  users: User[];
  contactMessages: {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
  }[];
}

const DEFAULT_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Chief Editor (Admin)',
    email: 'admin@nexusblog.dev',
    role: 'admin',
    avatar: '/src/assets/images/author_portrait_sarah_1790181779835.jpg',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'user-editor',
    name: 'Marcus Vance (Editor)',
    email: 'marcus@nexusblog.dev',
    role: 'editor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    createdAt: '2025-01-10T00:00:00.000Z',
    updatedAt: '2025-01-10T00:00:00.000Z',
  },
  {
    id: 'user-author',
    name: 'David Kim (Author)',
    email: 'david@nexusblog.dev',
    role: 'author',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    createdAt: '2025-02-01T00:00:00.000Z',
    updatedAt: '2025-02-01T00:00:00.000Z',
  },
];

const DEFAULT_MEDIA: Media[] = [
  {
    id: 'media-1',
    filename: 'hero_nestjs_architecture.jpg',
    url: '/src/assets/images/hero_nestjs_architecture_1790181779835.jpg',
    alt: 'Enterprise NestJS Architecture',
    caption: 'Production NestJS microservice layout',
    mimeType: 'image/jpeg',
    filesize: 245120,
    width: 1920,
    height: 1080,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'media-2',
    filename: 'article_postgres_tuning.jpg',
    url: '/src/assets/images/article_postgres_tuning_1790181792193.jpg',
    alt: 'PostgreSQL Query Planner and Buffer Hits',
    caption: 'Postgres indexing and cache tuning',
    mimeType: 'image/jpeg',
    filesize: 312450,
    width: 1920,
    height: 1080,
    createdAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'media-3',
    filename: 'article_supabase_cloud.jpg',
    url: '/src/assets/images/article_supabase_cloud_1790181803350.jpg',
    alt: 'Supabase PostgreSQL Cloud Architecture',
    caption: 'Supabase database replication and storage',
    mimeType: 'image/jpeg',
    filesize: 218900,
    width: 1920,
    height: 1080,
    createdAt: '2026-01-03T00:00:00.000Z',
  },
  {
    id: 'media-4',
    filename: 'article_payload_cms.jpg',
    url: '/src/assets/images/article_payload_cms_1790181815671.jpg',
    alt: 'Payload CMS Editorial Workspace',
    caption: 'Headless CMS structured content model',
    mimeType: 'image/jpeg',
    filesize: 198200,
    width: 1920,
    height: 1080,
    createdAt: '2026-01-04T00:00:00.000Z',
  },
];

class StorageEngine {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadInitialState();
  }

  private loadInitialState(): DatabaseState {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && Array.isArray(parsed.posts) && parsed.posts.length > 0) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Could not read from localStorage, using memory seed database', err);
      }
    }

    return {
      posts: SEED_POSTS,
      categories: SEED_CATEGORIES,
      tags: SEED_TAGS,
      authors: SEED_AUTHORS,
      comments: SEED_COMMENTS,
      subscribers: SEED_NEWSLETTER_SUBSCRIBERS,
      pages: SEED_PAGES,
      redirects: SEED_REDIRECTS,
      media: DEFAULT_MEDIA,
      settings: SEED_SITE_SETTINGS,
      users: DEFAULT_USERS,
      contactMessages: [],
    };
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (err) {
        console.warn('Could not save to localStorage', err);
      }
    }
  }

  // --- POSTS ---
  public getPosts(options?: {
    status?: PostStatus | 'all';
    categoryId?: string;
    categorySlug?: string;
    tagSlug?: string;
    authorSlug?: string;
    search?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
    sort?: 'newest' | 'oldest' | 'views' | 'readingTime';
  }) {
    let list = [...this.state.posts];

    // Check scheduled posts: if scheduledAt <= NOW, status transitions to published
    const now = new Date();
    list = list.map(p => {
      if (p.status === 'scheduled' && p.scheduledAt && new Date(p.scheduledAt) <= now) {
        return { ...p, status: 'published' as PostStatus, publishedAt: p.scheduledAt };
      }
      return p;
    });

    // Filter status: by default only 'published' for public site, unless 'all' or explicit
    const targetStatus = options?.status ?? 'published';
    if (targetStatus !== 'all') {
      list = list.filter(p => p.status === targetStatus);
    }

    // Category filter
    if (options?.categorySlug) {
      const cat = this.state.categories.find(c => c.slug === options.categorySlug);
      if (cat) {
        list = list.filter(p => p.categoryIds.includes(cat.id));
      } else {
        list = [];
      }
    } else if (options?.categoryId) {
      list = list.filter(p => p.categoryIds.includes(options.categoryId!));
    }

    // Tag filter
    if (options?.tagSlug) {
      const tag = this.state.tags.find(t => t.slug === options.tagSlug);
      if (tag) {
        list = list.filter(p => p.tagIds.includes(tag.id));
      } else {
        list = [];
      }
    }

    // Author filter
    if (options?.authorSlug) {
      const author = this.state.authors.find(a => a.slug === options.authorSlug);
      if (author) {
        list = list.filter(p => p.authorId === author.id);
      } else {
        list = [];
      }
    }

    // Featured filter
    if (options?.featured !== undefined) {
      list = list.filter(p => p.featured === options.featured);
    }

    // Search query across title, excerpt, content
    if (options?.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(p => {
        const titleMatch = p.title.toLowerCase().includes(q);
        const excerptMatch = p.excerpt.toLowerCase().includes(q);
        const contentMatch = p.content.some(block => block.content?.toLowerCase().includes(q));
        const tagMatch = p.tagIds.some(tid => {
          const t = this.state.tags.find(item => item.id === tid);
          return t?.name.toLowerCase().includes(q) || t?.slug.includes(q);
        });
        const categoryMatch = p.categoryIds.some(cid => {
          const c = this.state.categories.find(item => item.id === cid);
          return c?.name.toLowerCase().includes(q) || c?.slug.includes(q);
        });
        return titleMatch || excerptMatch || contentMatch || tagMatch || categoryMatch;
      });
    }

    // Sorting
    const sortMode = options?.sort ?? 'newest';
    list.sort((a, b) => {
      if (sortMode === 'views') return b.views - a.views;
      if (sortMode === 'readingTime') return a.readingTime - b.readingTime;
      if (sortMode === 'oldest') {
        return new Date(a.publishedAt || a.createdAt).getTime() - new Date(b.publishedAt || b.createdAt).getTime();
      }
      return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();
    });

    const total = list.length;
    const page = Math.max(1, options?.page ?? 1);
    const limit = options?.limit ?? 10;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = list.slice((page - 1) * limit, page * limit);

    // Populate relations
    const populated = paginated.map(p => this.populatePost(p));

    return {
      posts: populated,
      total,
      page,
      limit,
      totalPages,
    };
  }

  public getPostBySlug(slug: string, includeUnpublished = false): Post | null {
    const post = this.state.posts.find(p => p.slug === slug);
    if (!post) return null;
    if (!includeUnpublished && post.status !== 'published') {
      return null;
    }
    return this.populatePost(post);
  }

  public incrementPostViews(slug: string) {
    const post = this.state.posts.find(p => p.slug === slug);
    if (post) {
      post.views = (post.views || 0) + 1;
      this.persist();
    }
  }

  public savePost(postData: Partial<Post> & { title: string; excerpt: string; authorId: string; categoryIds: string[] }): Post {
    const isNew = !postData.id;
    const id = postData.id || `post-${Date.now()}`;
    
    // Auto-generate slug if not specified or clean it
    let slug = postData.slug?.trim() || postData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check slug collision
    const existingWithSlug = this.state.posts.find(p => p.slug === slug && p.id !== id);
    if (existingWithSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const now = new Date().toISOString();
    const status = postData.status || 'draft';
    const publishedAt = status === 'published' ? (postData.publishedAt || now) : postData.publishedAt || null;

    // Calculate reading time
    const wordCount = postData.content
      ? postData.content.reduce((acc, block) => acc + (block.content ? block.content.split(/\s+/).length : 0), 0)
      : postData.excerpt.split(/\s+/).length;
    const readingTime = Math.max(1, Math.round(wordCount / 200));

    const post: Post = {
      id,
      title: postData.title,
      slug,
      excerpt: postData.excerpt,
      content: postData.content || [{ id: 'b1', type: 'paragraph', content: postData.excerpt }],
      featuredImage: postData.featuredImage || '/src/assets/images/hero_nestjs_architecture_1790181779835.jpg',
      featuredImageCaption: postData.featuredImageCaption,
      authorId: postData.authorId,
      categoryIds: postData.categoryIds,
      tagIds: postData.tagIds || [],
      status,
      publishedAt,
      scheduledAt: postData.scheduledAt || null,
      readingTime,
      views: postData.views || 0,
      allowComments: postData.allowComments ?? true,
      featured: postData.featured ?? false,
      seo: postData.seo || {
        title: `${postData.title} | NexusBlog`,
        description: postData.excerpt,
      },
      relatedPostIds: postData.relatedPostIds || [],
      createdAt: isNew ? now : (postData.createdAt || now),
      updatedAt: now,
    };

    if (isNew) {
      this.state.posts.unshift(post);
    } else {
      const idx = this.state.posts.findIndex(p => p.id === id);
      if (idx !== -1) {
        this.state.posts[idx] = post;
      } else {
        this.state.posts.unshift(post);
      }
    }

    this.persist();
    return this.populatePost(post);
  }

  public deletePost(id: string): boolean {
    const initialLen = this.state.posts.length;
    this.state.posts = this.state.posts.filter(p => p.id !== id);
    this.state.comments = this.state.comments.filter(c => c.postId !== id);
    this.persist();
    return this.state.posts.length < initialLen;
  }

  private populatePost(p: Post): Post {
    return {
      ...p,
      author: this.state.authors.find(a => a.id === p.authorId),
      categories: this.state.categories.filter(c => p.categoryIds.includes(c.id)),
      tags: this.state.tags.filter(t => p.tagIds.includes(t.id)),
    };
  }

  // --- CATEGORIES & TAGS ---
  public getCategories(): Category[] {
    return this.state.categories.map(cat => ({
      ...cat,
      postCount: this.state.posts.filter(p => p.status === 'published' && p.categoryIds.includes(cat.id)).length,
    }));
  }

  public getCategoryBySlug(slug: string): Category | null {
    const cat = this.state.categories.find(c => c.slug === slug);
    if (!cat) return null;
    return {
      ...cat,
      postCount: this.state.posts.filter(p => p.status === 'published' && p.categoryIds.includes(cat.id)).length,
    };
  }

  public saveCategory(categoryData: Partial<Category> & { name: string; slug: string }): Category {
    const id = categoryData.id || `cat-${Date.now()}`;
    const category: Category = {
      id,
      name: categoryData.name,
      slug: categoryData.slug.toLowerCase().trim().replace(/[\s_]+/g, '-'),
      description: categoryData.description || '',
      image: categoryData.image,
      seoTitle: categoryData.seoTitle,
      seoDescription: categoryData.seoDescription,
    };

    const idx = this.state.categories.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.state.categories[idx] = category;
    } else {
      this.state.categories.push(category);
    }

    this.persist();
    return category;
  }

  public getTags(): Tag[] {
    return this.state.tags.map(t => ({
      ...t,
      postCount: this.state.posts.filter(p => p.status === 'published' && p.tagIds.includes(t.id)).length,
    }));
  }

  public getTagBySlug(slug: string): Tag | null {
    const tag = this.state.tags.find(t => t.slug === slug);
    if (!tag) return null;
    return {
      ...tag,
      postCount: this.state.posts.filter(p => p.status === 'published' && p.tagIds.includes(tag.id)).length,
    };
  }

  public saveTag(tagData: Partial<Tag> & { name: string; slug: string }): Tag {
    const id = tagData.id || `tag-${Date.now()}`;
    const tag: Tag = {
      id,
      name: tagData.name,
      slug: tagData.slug.toLowerCase().trim().replace(/[\s_]+/g, '-'),
      description: tagData.description || '',
    };

    const idx = this.state.tags.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.state.tags[idx] = tag;
    } else {
      this.state.tags.push(tag);
    }

    this.persist();
    return tag;
  }

  // --- AUTHORS ---
  public getAuthors(): Author[] {
    return this.state.authors.map(a => ({
      ...a,
      articleCount: this.state.posts.filter(p => p.status === 'published' && p.authorId === a.id).length,
    }));
  }

  public getAuthorBySlug(slug: string): Author | null {
    const a = this.state.authors.find(item => item.slug === slug);
    if (!a) return null;
    return {
      ...a,
      articleCount: this.state.posts.filter(p => p.status === 'published' && p.authorId === a.id).length,
    };
  }

  // --- COMMENTS ---
  public getComments(postId?: string, status?: 'approved' | 'pending' | 'all') {
    let list = [...this.state.comments];
    if (postId) {
      list = list.filter(c => c.postId === postId);
    }
    if (status && status !== 'all') {
      list = list.filter(c => c.status === status);
    }
    return list;
  }

  public addComment(data: { postId: string; name: string; email: string; website?: string; comment: string; parentId?: string }): { success: boolean; comment?: Comment; message: string } {
    // Basic anti-spam validation
    if (!data.name || !data.email || !data.comment) {
      return { success: false, message: 'All required fields must be completed.' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return { success: false, message: 'Please provide a valid email address.' };
    }
    if (data.comment.length < 5) {
      return { success: false, message: 'Comment text is too short.' };
    }

    const spamKeywords = ['viagra', 'casino', 'free crypto', 'xyz-crypto', 'earn 500%'];
    const isLikelySpam = spamKeywords.some(keyword => data.comment.toLowerCase().includes(keyword));

    const newComment: Comment = {
      id: `com-${Date.now()}`,
      postId: data.postId,
      parentId: data.parentId || null,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      website: data.website?.trim(),
      comment: data.comment.trim(),
      status: isLikelySpam ? 'spam' : 'approved', // Auto-approve clean comments for seamless interactive testing, flag spam
      createdAt: new Date().toISOString(),
    };

    if (data.parentId) {
      // Add as nested reply to parent
      const parent = this.state.comments.find(c => c.id === data.parentId);
      if (parent) {
        if (!parent.replies) parent.replies = [];
        parent.replies.push(newComment);
      }
    }

    this.state.comments.unshift(newComment);
    this.persist();

    return {
      success: true,
      comment: newComment,
      message: isLikelySpam ? 'Your comment has been submitted and is pending moderation.' : 'Your comment was posted successfully!',
    };
  }

  public updateCommentStatus(commentId: string, status: 'approved' | 'pending' | 'rejected' | 'spam') {
    const c = this.state.comments.find(item => item.id === commentId);
    if (c) {
      c.status = status;
      this.persist();
      return true;
    }
    return false;
  }

  // --- NEWSLETTER ---
  public subscribeNewsletter(email: string, name?: string, source = 'website'): { success: boolean; message: string } {
    const cleanEmail = email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, message: 'Invalid email address format.' };
    }

    const existing = this.state.subscribers.find(s => s.email === cleanEmail);
    if (existing) {
      if (existing.status === 'active') {
        return { success: false, message: 'This email is already subscribed to the NexusBlog newsletter.' };
      }
      existing.status = 'active';
      existing.subscribedAt = new Date().toISOString();
      existing.unsubscribedAt = null;
      this.persist();
      return { success: true, message: 'Welcome back! Your subscription has been reactivated.' };
    }

    const newSub: NewsletterSubscriber = {
      id: `sub-${Date.now()}`,
      email: cleanEmail,
      name: name?.trim(),
      status: 'active',
      subscribedAt: new Date().toISOString(),
      source,
    };

    this.state.subscribers.unshift(newSub);
    this.persist();
    return { success: true, message: 'Thank you for subscribing! You will receive our next weekly architecture digest.' };
  }

  public getSubscribers(): NewsletterSubscriber[] {
    return [...this.state.subscribers];
  }

  // --- CONTACT ---
  public submitContact(data: { name: string; email: string; subject: string; message: string }): { success: boolean; message: string } {
    if (!data.name || !data.email || !data.subject || !data.message) {
      return { success: false, message: 'Please fill in all required fields.' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return { success: false, message: 'Please provide a valid contact email.' };
    }

    this.state.contactMessages.unshift({
      id: `msg-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      subject: data.subject.trim(),
      message: data.message.trim(),
      createdAt: new Date().toISOString(),
    });
    this.persist();
    return { success: true, message: 'Your message has been received by our editorial and support team.' };
  }

  // --- REDIRECTS (301 System) ---
  public getRedirects(): Redirect[] {
    return [...this.state.redirects];
  }

  public findRedirect(path: string): Redirect | null {
    const cleanPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
    const match = this.state.redirects.find(r => {
      if (!r.active) return false;
      const src = r.source.endsWith('/') && r.source.length > 1 ? r.source.slice(0, -1) : r.source;
      return src === cleanPath || src === path;
    });

    if (match) {
      match.hitCount = (match.hitCount || 0) + 1;
      this.persist();
    }
    return match || null;
  }

  public saveRedirect(data: { source: string; destination: string; statusCode?: 301 | 302; active?: boolean }): Redirect {
    const id = `red-${Date.now()}`;
    const redirect: Redirect = {
      id,
      source: data.source.trim(),
      destination: data.destination.trim(),
      statusCode: data.statusCode || 301,
      active: data.active ?? true,
      hitCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.state.redirects.unshift(redirect);
    this.persist();
    return redirect;
  }

  public deleteRedirect(id: string) {
    this.state.redirects = this.state.redirects.filter(r => r.id !== id);
    this.persist();
  }

  // --- PAGES ---
  public getPages(): Page[] {
    return [...this.state.pages];
  }

  public getPageBySlug(slug: string): Page | null {
    return this.state.pages.find(p => p.slug === slug) || null;
  }

  // --- SITE SETTINGS ---
  public getSettings(): SiteSettings {
    return { ...this.state.settings };
  }

  public updateSettings(newSettings: Partial<SiteSettings>): SiteSettings {
    this.state.settings = {
      ...this.state.settings,
      ...newSettings,
    };
    this.persist();
    return this.state.settings;
  }

  // --- MEDIA ---
  public getMedia(): Media[] {
    return [...this.state.media];
  }

  public addMedia(mediaData: Omit<Media, 'id' | 'createdAt'>): Media {
    const newMedia: Media = {
      ...mediaData,
      id: `media-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.media.unshift(newMedia);
    this.persist();
    return newMedia;
  }

  // --- WORDPRESS MIGRATION ENGINE ---
  public importFromWordPress(wpExportJsonOrXml: string | { posts: any[]; categories?: any[]; tags?: any[] }): {
    success: boolean;
    importedPosts: number;
    createdRedirects: number;
    importedCategories: number;
    importedTags: number;
    log: string[];
  } {
    const log: string[] = [];
    let importedPosts = 0;
    let createdRedirects = 0;
    let importedCategories = 0;
    let importedTags = 0;

    try {
      log.push('Starting WordPress WXR import pipeline...');

      // Handle sample or parsed payload
      let data = typeof wpExportJsonOrXml === 'string'
        ? JSON.parse(wpExportJsonOrXml)
        : wpExportJsonOrXml;

      if (!data.posts || !Array.isArray(data.posts)) {
        throw new Error('Invalid WordPress export format: "posts" array missing.');
      }

      for (const item of data.posts) {
        // Compute clean slug
        const cleanSlug = (item.slug || item.title)
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');

        // Generate 301 redirect if oldUrl exists
        if (item.oldUrl) {
          const redirect = this.saveRedirect({
            source: item.oldUrl,
            destination: `/blog/${cleanSlug}`,
            statusCode: 301,
            active: true,
          });
          createdRedirects++;
          log.push(`Created 301 redirect: ${item.oldUrl} -> /blog/${cleanSlug}`);
        }

        // Check if exists
        const existing = this.state.posts.find(p => p.slug === cleanSlug);
        if (!existing) {
          this.savePost({
            title: item.title,
            slug: cleanSlug,
            excerpt: item.excerpt || 'Imported article from WordPress archive.',
            content: [
              {
                id: `b-${Date.now()}`,
                type: 'paragraph',
                content: item.content || item.excerpt || '',
              },
            ],
            authorId: 'author-sarah',
            categoryIds: ['cat-technology'],
            tagIds: ['tag-typescript'],
            status: 'published',
            publishedAt: item.date || new Date().toISOString(),
            featuredImage: item.featuredImage || '/src/assets/images/hero_nestjs_architecture_1790181779835.jpg',
          });
          importedPosts++;
          log.push(`Successfully migrated article: "${item.title}"`);
        } else {
          log.push(`Skipped duplicate article slug: "${cleanSlug}"`);
        }
      }

      log.push(`Migration complete: ${importedPosts} posts imported, ${createdRedirects} 301 redirects preserved.`);
      return {
        success: true,
        importedPosts,
        createdRedirects,
        importedCategories,
        importedTags,
        log,
      };
    } catch (err: any) {
      log.push(`Error during migration: ${err.message}`);
      return {
        success: false,
        importedPosts,
        createdRedirects,
        importedCategories,
        importedTags,
        log,
      };
    }
  }

  // --- SITEMAP GENERATOR ---
  public generateSitemapXml(): string {
    const siteUrl = this.state.settings.siteUrl || 'https://nexusblog.dev';
    const publishedPosts = this.state.posts.filter(p => p.status === 'published');
    const categories = this.state.categories;
    const tags = this.state.tags;
    const authors = this.state.authors;
    const pages = this.state.pages;

    interface SitemapUrlItem {
      loc: string;
      lastmod?: string | null;
      priority: string;
      changefreq: string;
    }

    const urls: SitemapUrlItem[] = [
      { loc: `${siteUrl}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${siteUrl}/blog`, priority: '0.9', changefreq: 'daily' },
      { loc: `${siteUrl}/about`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${siteUrl}/contact`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${siteUrl}/privacy-policy`, priority: '0.3', changefreq: 'yearly' },
      { loc: `${siteUrl}/terms`, priority: '0.3', changefreq: 'yearly' },
      ...publishedPosts.map((p) => ({
        loc: `${siteUrl}/blog/${p.slug}`,
        lastmod: p.updatedAt || p.publishedAt,
        priority: p.featured ? '0.9' : '0.8',
        changefreq: 'weekly',
      })),
      ...categories.map((c) => ({
        loc: `${siteUrl}/category/${c.slug}`,
        priority: '0.7',
        changefreq: 'weekly',
      })),
      ...tags.map((t) => ({
        loc: `${siteUrl}/tag/${t.slug}`,
        priority: '0.6',
        changefreq: 'weekly',
      })),
      ...authors.map((a) => ({
        loc: `${siteUrl}/author/${a.slug}`,
        priority: '0.6',
        changefreq: 'monthly',
      })),
    ];

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    u => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;
  }

  // --- ROBOTS.TXT GENERATOR ---
  public generateRobotsTxt(): string {
    const siteUrl = this.state.settings.siteUrl || 'https://nexusblog.dev';
    return `# NexusBlog Robots Policy
User-agent: *
Allow: /
Allow: /blog
Allow: /blog/*
Allow: /category/*
Allow: /tag/*
Allow: /author/*
Allow: /about
Allow: /contact

# Protect sensitive CMS and API endpoints
Disallow: /admin
Disallow: /admin/*
Disallow: /api/private/
Disallow: /login

Sitemap: ${siteUrl}/sitemap.xml
`;
  }
}

// Global Singleton Instance
export const storage = new StorageEngine();
