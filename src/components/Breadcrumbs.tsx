import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  url?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (route: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigate }) => {
  return (
    <nav aria-label="Breadcrumbs" className="py-3 text-xs font-sans text-stone-500 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
      <button
        onClick={() => onNavigate('/')}
        className="hover:text-stone-900 transition-colors"
      >
        Home
      </button>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3 h-3 text-stone-400 shrink-0" />
          {item.url ? (
            <button
              onClick={() => onNavigate(item.url!)}
              className="hover:text-stone-900 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-stone-900 font-medium truncate max-w-[240px] sm:max-w-md">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
