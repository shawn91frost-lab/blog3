import React, { useState } from 'react';
import { storage } from '../lib/storage';
import { Mail, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface NewsletterFormProps {
  source?: string;
  variant?: 'card' | 'inline' | 'minimal';
}

export const NewsletterForm: React.FC<NewsletterFormProps> = ({
  source = 'inline_cta',
  variant = 'card',
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setFeedback(null);

    setTimeout(() => {
      const res = storage.subscribeNewsletter(email, name, source);
      setLoading(false);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setEmail('');
        setName('');
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    }, 300);
  };

  if (variant === 'minimal') {
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your work email"
            required
            className="flex-1 px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-stone-800"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Subscribing...' : 'Join'}
          </button>
        </div>
        {feedback && (
          <p className={`text-xs ${feedback.type === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
            {feedback.message}
          </p>
        )}
      </form>
    );
  }

  return (
    <div className="bg-[#f2efe9] border border-stone-300/80 rounded-2xl p-6 sm:p-10 my-12 relative overflow-hidden">
      <div className="max-w-2xl mx-auto text-center space-y-4 relative z-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white text-stone-900 shadow-sm mb-1">
          <Mail className="w-5 h-5" />
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold font-editorial text-stone-950">
          The Engineering Dispatch
        </h3>

        <p className="text-sm text-stone-600 leading-relaxed max-w-lg mx-auto">
          Delivered every alternate Tuesday: Deep dives into PostgreSQL execution plans, NestJS microservice patterns, and headless CMS architectures. No sponsor spam.
        </p>

        {feedback?.type === 'success' ? (
          <div className="p-4 bg-white/80 border border-emerald-300 text-emerald-900 rounded-xl flex items-center justify-center gap-2 text-sm font-medium animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{feedback.message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="pt-2 space-y-3 max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                required
                className="flex-1 px-4 py-3 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 shadow-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-60 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>{loading ? 'Subscribing...' : 'Subscribe'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {feedback?.type === 'error' && (
              <div className="flex items-center gap-1.5 text-xs text-rose-700 justify-center">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{feedback.message}</span>
              </div>
            )}

            <p className="text-[11px] text-stone-500">
              Join 18,400+ backend architects and database engineers. Unsubscribe anytime in 1-click.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
