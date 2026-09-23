import React, { useEffect, useState } from 'react';
import { ContentBlock } from '../types/blog';
import { List } from 'lucide-react';

interface TableOfContentsProps {
  content: ContentBlock[];
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const [activeId, setActiveId] = useState<string>('');

  const headings: TocItem[] = content
    .filter((b) => b.type === 'heading' && b.content)
    .map((b) => {
      const text = b.content || '';
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      return {
        id,
        text,
        level: b.level || 2,
      };
    });

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0% -60% 0%' }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="p-5 bg-white border border-stone-200/90 rounded-2xl shadow-sm text-xs font-sans space-y-3">
      <div className="flex items-center gap-2 font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-2">
        <List className="w-3.5 h-3.5" />
        <span>Table of Contents</span>
      </div>
      <ul className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
        {headings.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li
              key={item.id}
              className={`${item.level === 3 ? 'pl-3' : 'pl-0'}`}
            >
              <button
                onClick={() => scrollToHeading(item.id)}
                className={`text-left line-clamp-2 transition-colors py-0.5 block w-full ${
                  isActive
                    ? 'text-stone-950 font-semibold border-l-2 border-amber-900 pl-2 -ml-2.5'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {item.text}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
