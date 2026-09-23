import React, { useState } from 'react';
import { ContentBlock } from '../types/blog';
import { Copy, Check, Info, AlertTriangle, Lightbulb, ExternalLink } from 'lucide-react';

interface ContentRendererProps {
  blocks: ContentBlock[];
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ blocks }) => {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div className="prose prose-stone max-w-none space-y-6 text-stone-800 leading-relaxed font-sans">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading': {
            const headingText = block.content || '';
            const anchorId = headingText
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/[\s_-]+/g, '-')
              .replace(/^-+|-+$/g, '');

            if (block.level === 3) {
              return (
                <h3
                  key={block.id || index}
                  id={anchorId}
                  className="text-xl sm:text-2xl font-bold font-editorial text-stone-900 pt-6 pb-2 scroll-mt-24"
                >
                  {headingText}
                </h3>
              );
            }
            return (
              <h2
                key={block.id || index}
                id={anchorId}
                className="text-2xl sm:text-3xl font-bold font-editorial text-stone-950 pt-8 pb-3 border-b border-stone-200/80 scroll-mt-24"
              >
                {headingText}
              </h2>
            );
          }

          case 'paragraph': {
            const isFirst = index === 0;
            return (
              <p
                key={block.id || index}
                className={`text-base sm:text-lg text-stone-700 leading-relaxed ${
                  isFirst
                    ? 'first-letter:text-5xl first-letter:font-editorial first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-stone-950'
                    : ''
                }`}
              >
                {block.content}
              </p>
            );
          }

          case 'blockquote':
            return (
              <blockquote
                key={block.id || index}
                className="p-6 my-6 border-l-4 border-amber-800 bg-[#f7f5f0] rounded-r-xl italic font-editorial text-lg text-stone-900 leading-relaxed"
              >
                <p>"{block.content}"</p>
                {block.caption && (
                  <cite className="block text-xs font-sans font-medium uppercase tracking-wider text-stone-500 mt-2 not-italic">
                    — {block.caption}
                  </cite>
                )}
              </blockquote>
            );

          case 'code':
            return (
              <div key={block.id || index} className="my-6 rounded-xl overflow-hidden bg-[#18181b] text-stone-100 shadow-md border border-stone-800">
                <div className="flex items-center justify-between px-4 py-2 bg-[#27272a] text-xs text-stone-400 font-mono border-b border-stone-700/60">
                  <span className="uppercase">{block.language || 'code'}</span>
                  <button
                    onClick={() => handleCopy(block.id, block.content || '')}
                    className="flex items-center gap-1 hover:text-white transition-colors py-0.5 px-2 rounded bg-stone-700/50 hover:bg-stone-700"
                  >
                    {copiedCodeId === block.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-stone-200">
                  <code>{block.content}</code>
                </pre>
              </div>
            );

          case 'callout': {
            const isWarning = block.calloutType === 'warning';
            const isTip = block.calloutType === 'tip';
            return (
              <div
                key={block.id || index}
                className={`p-4 sm:p-5 my-6 rounded-xl border flex items-start gap-3.5 ${
                  isWarning
                    ? 'bg-amber-50/80 border-amber-300/80 text-amber-950'
                    : isTip
                    ? 'bg-emerald-50/80 border-emerald-300/80 text-emerald-950'
                    : 'bg-sky-50/80 border-sky-300/80 text-sky-950'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isWarning ? (
                    <AlertTriangle className="w-5 h-5 text-amber-700" />
                  ) : isTip ? (
                    <Lightbulb className="w-5 h-5 text-emerald-700" />
                  ) : (
                    <Info className="w-5 h-5 text-sky-700" />
                  )}
                </div>
                <div className="text-sm sm:text-base leading-relaxed">
                  {block.content}
                </div>
              </div>
            );
          }

          case 'table':
            if (!block.tableData) return null;
            return (
              <div key={block.id || index} className="my-8 overflow-x-auto border border-stone-200 rounded-xl bg-white shadow-sm">
                <table className="w-full text-left text-sm text-stone-700">
                  <thead className="bg-[#f5f4f0] text-xs uppercase tracking-wider text-stone-900 border-b border-stone-200">
                    <tr>
                      {block.tableData.headers.map((h, hIdx) => (
                        <th key={hIdx} className="px-5 py-3.5 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {block.tableData.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-stone-50 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-5 py-3.5 align-top">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case 'image':
            return (
              <figure key={block.id || index} className="my-8 space-y-2">
                <div className="overflow-hidden rounded-xl bg-stone-100 border border-stone-200">
                  <img
                    src={block.url}
                    alt={block.alt || 'Editorial illustration'}
                    className="w-full object-cover max-h-[500px]"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {block.caption && (
                  <figcaption className="text-center text-xs text-stone-500 font-sans italic">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );

          case 'embed':
            return (
              <div key={block.id || index} className="my-8 aspect-video rounded-xl overflow-hidden bg-stone-900 shadow-md">
                <iframe
                  src={block.embedUrl || 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'}
                  title="Video Embed"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            );

          case 'divider':
            return <hr key={block.id || index} className="my-10 border-t border-stone-200" />;

          default:
            return null;
        }
      })}
    </div>
  );
};
