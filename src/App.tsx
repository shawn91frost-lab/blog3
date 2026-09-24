/**
 * NexusBlog Application Root
 * Production-ready blogging platform built with React 19 + Payload CMS + PostgreSQL architecture
 */

import React, { useState, useEffect } from 'react';
import { storage } from './lib/storage';
import { getSiteSettings, getNavigation } from './api';
import { SiteSettings } from './types/blog';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SearchBar } from './components/SearchBar';
import { HomeView } from './views/HomeView';
import { BlogListView } from './views/BlogListView';
import { SinglePostView } from './views/SinglePostView';
import { CategoryView } from './views/CategoryView';
import { TagView } from './views/TagView';
import { AuthorView } from './views/AuthorView';
import { SearchView } from './views/SearchView';
import { PageView } from './views/PageView';
import { ContactView } from './views/ContactView';
import { AdminView } from './views/AdminView';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQueryParam, setSearchQueryParam] = useState('');
  const [settings, setSettings] = useState<SiteSettings>(() => storage.getSettings());

  // Fetch live site settings & navigation from Payload CMS
  useEffect(() => {
    let active = true;
    getSiteSettings().then((liveSettings) => {
      if (active && liveSettings) {
        setSettings(liveSettings);
      }
    });

    getNavigation('header').then((navItems) => {
      if (active && navItems && navItems.length > 0) {
        setSettings((prev) => ({
          ...prev,
          headerNav: navItems.map((n) => ({ label: n.label, url: n.url })),
        }));
      }
    });

    return () => {
      active = false;
    };
  }, []);

  // Synchronize with window history
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/';
      const search = new URLSearchParams(window.location.search);
      const q = search.get('q') || '';
      setSearchQueryParam(q);
      handleNavigationInternal(path, false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (url: string) => {
    handleNavigationInternal(url, true);
  };

  const handleNavigationInternal = (url: string, pushHistory = true) => {
    // Check 301 Redirect Registry first (WordPress permalink migration)
    const redirect = storage.findRedirect(url);
    const targetUrl = redirect ? redirect.destination : url;

    if (redirect) {
      console.log(`[301 Redirect] ${url} -> ${redirect.destination} (hit count: ${redirect.hitCount})`);
    }

    if (pushHistory && typeof window !== 'undefined') {
      window.history.pushState({}, '', targetUrl);
    }

    // Parse path and search
    let path = targetUrl;
    let query = '';
    if (targetUrl.includes('?')) {
      const parts = targetUrl.split('?');
      path = parts[0];
      const params = new URLSearchParams(parts[1]);
      query = params.get('q') || '';
    }

    setSearchQueryParam(query);
    setCurrentRoute(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // State data snapshots
  const postsResult = storage.getPosts({ status: 'published', limit: 50 });
  const posts = postsResult.posts;
  const categories = storage.getCategories();
  const tags = storage.getTags();
  const authors = storage.getAuthors();

  // Route Resolver
  const renderView = () => {
    if (currentRoute === '/' || currentRoute === '') {
      return (
        <HomeView
          posts={posts}
          categories={categories}
          authors={authors}
          settings={settings}
          onNavigate={navigate}
        />
      );
    }

    if (currentRoute === '/blog' || currentRoute === '/articles') {
      return (
        <BlogListView
          posts={posts}
          categories={categories}
          tags={tags}
          onNavigate={navigate}
        />
      );
    }

    if (currentRoute.startsWith('/blog/')) {
      const slug = currentRoute.replace('/blog/', '').replace(/\/$/, '');
      return <SinglePostView slug={slug} onNavigate={navigate} />;
    }

    if (currentRoute.startsWith('/category/')) {
      const slug = currentRoute.replace('/category/', '').replace(/\/$/, '');
      return <CategoryView slug={slug} onNavigate={navigate} />;
    }

    if (currentRoute.startsWith('/tag/')) {
      const slug = currentRoute.replace('/tag/', '').replace(/\/$/, '');
      return <TagView slug={slug} onNavigate={navigate} />;
    }

    if (currentRoute.startsWith('/author/')) {
      const slug = currentRoute.replace('/author/', '').replace(/\/$/, '');
      return <AuthorView slug={slug} onNavigate={navigate} />;
    }

    if (currentRoute === '/search') {
      return <SearchView initialQuery={searchQueryParam} onNavigate={navigate} />;
    }

    if (currentRoute === '/contact') {
      return <ContactView onNavigate={navigate} />;
    }

    if (currentRoute.startsWith('/admin')) {
      return <AdminView onNavigate={navigate} />;
    }

    // Dynamic CMS Page Route (e.g. /about, /services, /privacy-policy, /terms, /any-slug)
    const cleanSlug = currentRoute.replace(/^\/+|\/+$/g, '');
    if (cleanSlug && !cleanSlug.includes('/')) {
      return <PageView slug={cleanSlug} onNavigate={navigate} />;
    }

    // Default Fallback
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-3xl font-bold font-editorial text-stone-900">404 — Document Not Located</h2>
        <p className="text-stone-600 text-sm max-w-md mx-auto">
          The requested route was not found in the index. Check our publication catalog or perform a search.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl"
        >
          Return to NexusBlog Home
        </button>
      </div>
    );
  };

  const isAdmin = currentRoute.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-stone-900 font-sans selection:bg-amber-900 selection:text-white">
      {/* Top Header */}
      <Header
        settings={settings}
        currentRoute={currentRoute}
        onNavigate={navigate}
        onOpenSearch={() => setSearchOpen(true)}
      />

      {/* Main Content Area */}
      <main className={`flex-1 ${isAdmin ? 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full'}`}>
        {renderView()}
      </main>

      {/* Footer */}
      {!isAdmin && <Footer settings={settings} onNavigate={navigate} />}

      {/* Search Modal */}
      <SearchBar
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={navigate}
      />
    </div>
  );
}
