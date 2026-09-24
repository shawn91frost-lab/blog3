import React, { useState } from 'react';
import { ContentBlock } from '../types/blog';
import { Copy, Check, Info, AlertTriangle, Lightbulb } from 'lucide-react';

interface ContentRendererProps {
  blocks?: ContentBlock[] | any;
  content?: string | any;
}

/**
 * Renders inline formatting (bold, italic, code, links) from markdown or Lexical inline nodes
 */
function renderFormattedText(text: string): React.ReactNode {
  if (!text) return null;

  // Simple safe parser for inline bold, italic, and links
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(<strong key={match.index} className="font-semibold text-stone-950">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em key={match.index} className="italic">{token.slice(1, -1)}</em>);
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(<code key={match.index} className="px-1.5 py-0.5 text-xs bg-stone-100 rounded text-amber-900 font-mono">{token.slice(1, -1)}</code>);
    } else if (token.startsWith('[') && token.includes('](')) {
      const label = token.substring(1, token.indexOf(']('));
      const url = token.substring(token.indexOf('](') + 2, token.length - 1);
      parts.push(
        <a key={match.index} href={url} target="_blank" rel="noreferrer" className="text-amber-800 underline hover:text-amber-950">
          {label}
        </a>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ blocks, content }) => {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2000);
    }
  };

  // If simple text content was passed (e.g. from standard Pages or plain strings)
  if (content && typeof content === 'string' && (!blocks || blocks.length === 0)) {
    const paragraphs = content.split(/\n\n+/);
    return (
      <div className="prose prose-stone max-w-none space-y-6 text-stone-800 leading-relaxed font-sans">
        {paragraphs.map((para, i) => {
          const trimmed = para.trim();
          if (trimmed.startsWith('# ')) {
            return <h1 key={i} className="text-3xl sm:text-4xl font-bold font-editorial text-stone-950 pt-6 pb-2">{trimmed.slice(2)}</h1>;
          }
          if (trimmed.startsWith('## ')) {
            return <h2 key={i} className="text-2xl sm:text-3xl font-bold font-editorial text-stone-950 pt-6 pb-2">{trimmed.slice(3)}</h2>;
          }
          if (trimmed.startsWith('### ')) {
            return <h3 key={i} className="text-xl sm:text-2xl font-bold font-editorial text-stone-900 pt-4 pb-1">{trimmed.slice(4)}</h3>;
          }
          if (trimmed.startsWith('> ')) {
            return (
              <blockquote key={i} className="p-5 my-4 border-l-4 border-amber-800 bg-[#f7f5f0] rounded-r-xl italic font-editorial text-lg text-stone-900">
                {trimmed.slice(2)}
              </blockquote>
            );
          }
          return (
            <p key={i} className={`text-base sm:text-lg text-stone-700 leading-relaxed ${i === 0 ? 'first-letter:text-5xl first-letter:font-editorial first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-stone-950' : ''}`}>
              {renderFormattedText(trimmed)}
            </p>
          );
        })}
      </div>
    );
  }

  // Handle Payload Lexical AST if passed directly
  if (content && typeof content === 'object' && content.root?.children) {
    return (
      <div className="prose prose-stone max-w-none space-y-6 text-stone-800 leading-relaxed font-sans">
        {content.root.children.map((node: any, idx: number) => {
          const text = node.children?.map((c: any) => c.text || '').join('') || '';
          if (node.type === 'heading') {
            const headingTag = node.tag === 'h3' ? 'h3' : 'h2';
            return headingTag === 'h3' ? (
              <h3 key={idx} className="font-editorial font-bold text-xl sm:text-2xl text-stone-950 pt-6 pb-2">{text}</h3>
            ) : (
              <h2 key={idx} className="font-editorial font-bold text-2xl sm:text-3xl text-stone-950 pt-6 pb-2">{text}</h2>
            );
          }
          if (node.type === 'quote') {
            return (
              <blockquote key={idx} className="p-5 my-4 border-l-4 border-amber-800 bg-[#f7f5f0] rounded-r-xl italic font-editorial text-lg text-stone-900">
                {text}
              </blockquote>
            );
          }
          return <p key={idx} className="text-base sm:text-lg text-stone-700 leading-relaxed">{renderFormattedText(text)}</p>;
        })}
      </div>
    );
  }

  if (!Array.isArray(blocks) || blocks.length === 0) {
    return null;
  }

  return (
    <div className="prose prose-stone max-w-none space-y-6 text-stone-800 leading-relaxed font-sans">
      {blocks.map((block: ContentBlock, index: number) => {
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
                {renderFormattedText(block.content || '')}
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

          case 'divider':
            return <hr key={block.id || index} className="my-10 border-t border-stone-200" />;

          default:
            return null;
        }
      })}
    </div>
  );
};
