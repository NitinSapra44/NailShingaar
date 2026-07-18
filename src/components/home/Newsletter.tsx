'use client';

import { useState } from 'react';
import { Send, Copy, Check, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const DISCOUNT_CODE = 'WELCOME15';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');

    const { error: dbError } = await (supabase as any)
      .from('newsletter_subscribers')
      .insert([{ email: email.trim().toLowerCase(), discount_code: DISCOUNT_CODE }]);

    if (dbError) {
      if (dbError.code === '23505') {
        // Duplicate email — still show the code, just remind them
        setSubscribed(true);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } else {
      setSubscribed(true);
    }

    setEmail('');
    setLoading(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(DISCOUNT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      <div className="absolute -top-28 -right-28 w-96 h-96 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-28 -left-28 w-96 h-96 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/5 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        <p className="text-[11px] font-bold tracking-[0.3em] text-white/55 uppercase mb-5">Exclusive Access</p>

        {!subscribed ? (
          <>
            <h2 className="font-display text-5xl md:text-7xl text-white leading-[0.9] tracking-tight mb-5">
              GET 15% OFF<br />YOUR FIRST ORDER
            </h2>
            <p className="text-white/65 italic mb-10 max-w-sm mx-auto">
              Plus early access to new collections, nail tips, and members-only deals.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="flex-1 bg-white/20 text-white placeholder:text-white/55 border border-white/30 rounded-full px-6 h-12 text-sm outline-none focus:bg-white/30 transition-colors"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-white text-primary font-bold text-sm px-8 h-12 rounded-full hover:bg-white/90 transition-colors flex items-center gap-2 justify-center shrink-0 disabled:opacity-70"
              >
                {loading ? 'Subscribing...' : (<>Subscribe <Send className="h-3.5 w-3.5" /></>)}
              </button>
            </form>

            {error && <p className="text-white/80 text-sm mt-3">{error}</p>}
            <p className="text-xs text-white/35 mt-5">Unsubscribe anytime. No spam, ever. We promise.</p>
          </>
        ) : (
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-white/15 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-5">
              <Sparkles className="h-3.5 w-3.5" /> Welcome to the family!
            </div>
            <h2 className="font-display text-4xl md:text-6xl text-white leading-[0.95] tracking-tight mb-4">
              YOUR 15% OFF<br />CODE IS READY
            </h2>
            <p className="text-white/65 italic mb-8 max-w-sm mx-auto">
              Use this code at checkout or mention it when placing your custom order.
            </p>

            <button
              onClick={copyCode}
              className="inline-flex items-center gap-3 bg-white text-primary font-bold text-2xl px-10 py-4 rounded-2xl hover:bg-white/90 transition-colors shadow-lg tracking-widest"
            >
              {DISCOUNT_CODE}
              {copied
                ? <Check className="h-5 w-5 text-green-500" />
                : <Copy className="h-5 w-5 text-primary/60" />}
            </button>
            <p className="text-xs text-white/40 mt-4">Tap to copy · Valid on your first order</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
