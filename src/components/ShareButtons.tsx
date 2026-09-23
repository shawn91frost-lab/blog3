import React, { useState } from 'react';
import { Twitter, Linkedin, Facebook, Link2, Check } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url?: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitterShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank'
    );
  };

  const handleLinkedInShare = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      '_blank'
    );
  };

  const handleFacebookShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank'
    );
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-stone-400 uppercase font-sans font-medium mr-1">Share:</span>
      <button
        onClick={handleTwitterShare}
        className="p-2 text-stone-600 hover:text-stone-950 hover:bg-stone-200/60 rounded-full transition-colors"
        title="Share on X / Twitter"
      >
        <Twitter className="w-4 h-4" />
      </button>
      <button
        onClick={handleLinkedInShare}
        className="p-2 text-stone-600 hover:text-stone-950 hover:bg-stone-200/60 rounded-full transition-colors"
        title="Share on LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
      </button>
      <button
        onClick={handleFacebookShare}
        className="p-2 text-stone-600 hover:text-stone-950 hover:bg-stone-200/60 rounded-full transition-colors"
        title="Share on Facebook"
      >
        <Facebook className="w-4 h-4" />
      </button>
      <button
        onClick={handleCopy}
        className="p-2 text-stone-600 hover:text-stone-950 hover:bg-stone-200/60 rounded-full transition-colors relative"
        title="Copy article link"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Link2 className="w-4 h-4" />}
      </button>
      {copied && (
        <span className="text-[11px] text-emerald-700 font-medium animate-in fade-in">
          Link copied!
        </span>
      )}
    </div>
  );
};
