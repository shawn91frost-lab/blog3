import React, { useState } from 'react';
import { storage } from '../lib/storage';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface CommentFormProps {
  postId: string;
  parentId?: string | null;
  parentAuthorName?: string;
  onCommentSubmitted: () => void;
  onCancelReply?: () => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  postId,
  parentId = null,
  parentAuthorName,
  onCommentSubmitted,
  onCancelReply,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [comment, setComment] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Anti-spam bot trap
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If honeypot is filled, silent reject (bot detected)
    if (honeypot) {
      setResult({ success: true, message: 'Thank you for your comment.' });
      return;
    }

    setLoading(true);
    setResult(null);

    setTimeout(() => {
      const res = storage.addComment({
        postId,
        parentId: parentId || undefined,
        name,
        email,
        website,
        comment,
      });
      setLoading(false);
      setResult(res);

      if (res.success) {
        setName('');
        setEmail('');
        setWebsite('');
        setComment('');
        onCommentSubmitted();
      }
    }, 300);
  };

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base font-bold font-editorial text-stone-900">
          {parentId ? `Reply to ${parentAuthorName || 'comment'}` : 'Leave a Comment'}
        </h4>
        {parentId && onCancelReply && (
          <button
            type="button"
            onClick={onCancelReply}
            className="text-xs text-stone-500 hover:text-stone-800 underline"
          >
            Cancel reply
          </button>
        )}
      </div>

      {result && (
        <div
          className={`p-4 mb-4 rounded-xl flex items-start gap-2.5 text-xs font-sans ${
            result.success
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span>{result.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Anti-spam honeypot hidden from human users */}
        <input
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Elena Vance"
              className="w-full px-3.5 py-2.5 text-sm bg-[#faf9f6] border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Work Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="elena@infrastructure.io"
              className="w-full px-3.5 py-2.5 text-sm bg-[#faf9f6] border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
            />
            <p className="text-[10px] text-stone-400 mt-1">Email is kept private and never published.</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Website or Profile (Optional)
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://github.com/username"
            className="w-full px-3.5 py-2.5 text-sm bg-[#faf9f6] border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Comment or Question <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your architecture perspective, questions, or benchmarks..."
            className="w-full px-3.5 py-2.5 text-sm bg-[#faf9f6] border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-xl transition-colors inline-flex items-center gap-2"
        >
          <span>{loading ? 'Submitting...' : 'Post Comment'}</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
