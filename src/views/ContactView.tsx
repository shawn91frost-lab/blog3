import React, { useState } from 'react';
import { storage } from '../lib/storage';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SEOHead } from '../components/SEOHead';
import { Mail, MapPin, Phone, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface ContactViewProps {
  onNavigate: (route: string) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ onNavigate }) => {
  const settings = storage.getSettings();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    setTimeout(() => {
      const res = storage.submitContact({ name, email, subject, message });
      setLoading(false);
      setFeedback(res);
      if (res.success) {
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      }
    }, 300);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <SEOHead
        title="Contact Editorial & Support | NexusBlog"
        description="Get in touch with NexusBlog editors, submit article pitches, report security findings, or request media inquiries."
      />

      <Breadcrumbs items={[{ label: 'Contact Editorial' }]} onNavigate={onNavigate} />

      <header className="border-b border-stone-200 pb-6">
        <h1 className="text-3xl sm:text-4xl font-bold font-editorial text-stone-950 mb-2">
          Contact the NexusBlog Team
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-2xl">
          Have an architectural proposal, peer-review suggestion, or query regarding our research publications? We welcome thoughtful engineering inquiries.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Information */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-[#f5f4f0] border border-stone-200 rounded-2xl space-y-4">
            <h3 className="text-base font-bold font-editorial text-stone-900">
              Editorial Headquarters
            </h3>

            <div className="space-y-3 text-xs text-stone-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-900 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-900 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-stone-950 underline">
                  {settings.email}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-900 shrink-0" />
                <span>{settings.phone}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 text-xs text-stone-500 space-y-1">
              <p className="font-semibold text-stone-800">Review Response Times:</p>
              <p>Technical article submissions: 3–5 business days.</p>
              <p>Security vulnerabilities: within 24 hours.</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          {feedback && (
            <div
              className={`p-4 mb-6 rounded-xl flex items-start gap-2.5 text-xs font-sans ${
                feedback.success
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}
            >
              {feedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Your Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Chen"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#faf9f6] border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@enterprise.io"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#faf9f6] border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Technical Article Pitch / Peer Review"
                className="w-full px-3.5 py-2.5 text-sm bg-[#faf9f6] border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Message <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your proposal or question in detail..."
                className="w-full px-3.5 py-2.5 text-sm bg-[#faf9f6] border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-xl transition-all inline-flex items-center gap-2 shadow-sm"
            >
              <span>{loading ? 'Sending...' : 'Transmit Message'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
