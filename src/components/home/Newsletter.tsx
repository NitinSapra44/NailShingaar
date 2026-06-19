'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: 'Welcome to the family! 💅',
      description: "You'll receive exclusive offers and updates soon.",
    });
    setEmail('');
    setLoading(false);
  };

  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      <div className="absolute -top-28 -right-28 w-96 h-96 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-28 -left-28 w-96 h-96 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/5 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        <p className="text-[11px] font-bold tracking-[0.3em] text-white/55 uppercase mb-5">Exclusive Access</p>
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
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-white/20 text-white placeholder:text-white/55 border border-white/30 rounded-full px-6 h-12 text-sm outline-none focus:bg-white/30 transition-colors"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-primary font-bold text-sm px-8 h-12 rounded-full hover:bg-white/90 transition-colors flex items-center gap-2 justify-center shrink-0 disabled:opacity-70"
          >
            {loading ? 'Subscribing...' : (
              <>Subscribe <Send className="h-3.5 w-3.5" /></>
            )}
          </button>
        </form>

        <p className="text-xs text-white/35 mt-5">
          Unsubscribe anytime. No spam, ever. We promise.
        </p>
      </div>
    </section>
  );
};

export default Newsletter;
