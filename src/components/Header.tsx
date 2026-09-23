import React, { useState } from 'react';
import { Search, Menu, X, Sliders, ArrowUpRight } from 'lucide-react';
import { SiteSettings } from '../types/blog';

interface HeaderProps {
  settings: SiteSettings;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  currentRoute,
  onNavigate,
  onOpenSearch,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#faf9f6]/95 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark adhering to Top Bar Contract */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/')}
            className="text-xl font-bold tracking-tight text-stone-900 font-editorial hover:text-stone-700 transition-colors flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-stone-900 inline-block"></span>
            {settings.siteName}
          </button>
          <span className="hidden lg:inline text-xs text-stone-500 font-sans pl-2 border-l border-stone-200">
            Tech Architecture Journal
          </span>
        </div>

        {/* Zone 2: 4–6 clean text navigation links with subtle hover */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          {settings.headerNav.map((item) => {
            const isActive = currentRoute === item.url || (item.url !== '/' && currentRoute.startsWith(item.url));
            return (
              <button
                key={item.url}
                onClick={() => onNavigate(item.url)}
                className={`transition-colors relative py-1 text-sm ${
                  isActive ? 'text-stone-950 font-semibold' : 'hover:text-stone-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions (Search, Admin CMS Studio) */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSearch}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100/80 rounded-lg transition-colors flex items-center gap-1.5 text-xs"
            title="Search articles (Cmd+K)"
            aria-label="Search articles"
          >
            <Search className="w-4 h-4 text-stone-500" />
            <span className="hidden sm:inline text-stone-500">Search</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] text-stone-400 bg-stone-200/60 rounded">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={() => onNavigate('/admin')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              currentRoute.startsWith('/admin')
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-stone-200/70 hover:bg-stone-200 text-stone-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Payload CMS</span>
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-over Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-stone-200 bg-[#faf9f6] px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-2">
            {settings.headerNav.map((item) => (
              <button
                key={item.url}
                onClick={() => {
                  onNavigate(item.url);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 text-sm font-medium rounded-md ${
                  currentRoute === item.url ? 'bg-stone-200/60 text-stone-950 font-semibold' : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 border-t border-stone-200 flex flex-col gap-2">
              <button
                onClick={() => {
                  onNavigate('/admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-stone-900 bg-stone-100 rounded-md flex items-center justify-between"
              >
                <span>Payload CMS Studio</span>
                <ArrowUpRight className="w-4 h-4 text-stone-500" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
