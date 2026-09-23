import React from 'react';
import { SiteSettings } from '../types/blog';
import { Twitter, Github, Linkedin, Youtube, Rss, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  settings: SiteSettings;
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  return (
    <footer className="border-t border-stone-200 bg-[#f5f4f0] text-stone-700 mt-20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand & Editorial Mission */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => onNavigate('/')}
              className="text-2xl font-bold tracking-tight text-stone-900 font-editorial flex items-center gap-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-stone-900 inline-block"></span>
              {settings.siteName}
            </button>
            <p className="text-sm text-stone-600 leading-relaxed max-w-sm">
              {settings.siteDescription}
            </p>
            <div className="pt-2 text-xs text-stone-500 space-y-1">
              <p>San Francisco · London · Zurich</p>
              <p>Inquiries: <a href={`mailto:${settings.email}`} className="underline hover:text-stone-900">{settings.email}</a></p>
            </div>
          </div>

          {/* Dynamic Navigation Columns from CMS */}
          {settings.footerNav.map((col, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900 font-sans">
                {col.section}
              </h4>
              <ul className="space-y-2 text-sm text-stone-600">
                {col.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    {link.url.startsWith('http') || link.url.endsWith('.xml') || link.url.endsWith('.txt') ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-stone-900 transition-colors inline-flex items-center gap-1"
                      >
                        {link.label}
                        <ArrowUpRight className="w-3 h-3 opacity-60" />
                      </a>
                    ) : (
                      <button
                        onClick={() => onNavigate(link.url)}
                        className="hover:text-stone-900 transition-colors text-left"
                      >
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar: Quiet Copyright & Social Links */}
        <div className="pt-8 border-t border-stone-300/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>{settings.copyrightText}</p>

          <div className="flex items-center gap-4">
            {settings.socialLinks.twitter && (
              <a
                href={settings.socialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="hover:text-stone-900 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {settings.socialLinks.github && (
              <a
                href={settings.socialLinks.github}
                target="_blank"
                rel="noreferrer"
                className="hover:text-stone-900 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {settings.socialLinks.linkedin && (
              <a
                href={settings.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="hover:text-stone-900 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {settings.socialLinks.youtube && (
              <a
                href={settings.socialLinks.youtube}
                target="_blank"
                rel="noreferrer"
                className="hover:text-stone-900 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            )}
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noreferrer"
              className="hover:text-stone-900 transition-colors flex items-center gap-1 font-mono"
              title="Sitemap XML"
            >
              <Rss className="w-3.5 h-3.5" />
              <span>XML</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
