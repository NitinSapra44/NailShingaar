'use client';

import { useState } from 'react';
import { MessageCircle, Instagram, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const channels = [
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: 'Message Reet directly',
    sub: 'Fastest response — usually within a few hours',
    href: 'https://wa.me/919569570825',
    color: 'bg-green-500',
  },
  {
    icon: InstagramIcon,
    label: 'Instagram',
    value: '@nailshingaar',
    sub: 'DMs open — great for design inspiration & queries',
    href: 'https://www.instagram.com/nailshingaar',
    color: 'bg-gradient-to-br from-pink-500 to-orange-400',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'nailshingaar@gmail.com',
    sub: 'For formal enquiries or collaborations',
    href: 'mailto:nailshingaar@gmail.com',
    color: 'bg-primary',
  },
];

export default function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message) {
      toast({ title: 'Please fill in your name and message.', variant: 'destructive' });
      return;
    }
    // Build a WhatsApp message with the form details
    const text = encodeURIComponent(
      `Hi Reet! 👋\n\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\nMessage:\n${form.message}`
    );
    window.open(`https://wa.me/919569570825?text=${text}`, '_blank');
    setSent(true);
    toast({ title: 'Opening WhatsApp…', description: 'Your message has been pre-filled. Just hit Send!' });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-nude-light border-b border-border">
        <div className="container mx-auto px-4 py-14 max-w-3xl text-center">
          <h1 className="font-display text-4xl font-semibold mb-3">Contact Us</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Questions, custom order enquiries, or just want to chat about nails?
            Reet reads and replies to every message personally.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-10">

          {/* Left — Channels */}
          <div className="space-y-5">
            <h2 className="font-display text-2xl font-semibold">Get in Touch</h2>

            {channels.map((ch) => {
              const Icon = ch.icon;
              return (
                <a
                  key={ch.label}
                  href={ch.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border shadow-soft hover:border-primary/40 hover:shadow-glow transition-all"
                >
                  <div className={`h-12 w-12 rounded-full ${ch.color} flex items-center justify-center text-white shrink-0`}>
                    <Icon />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{ch.label}</p>
                    <p className="text-sm text-primary font-medium">{ch.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{ch.sub}</p>
                  </div>
                </a>
              );
            })}

            {/* Response time */}
            <div className="p-4 rounded-2xl bg-rose-gold-light border border-primary/20 flex items-center gap-3">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <p className="text-sm text-primary font-medium">Usually responds within a few hours on working days.</p>
            </div>
          </div>

          {/* Right — Form */}
          <div className="space-y-5">
            <h2 className="font-display text-2xl font-semibold">Send a Message</h2>
            <p className="text-sm text-muted-foreground">Fill in the form below — it'll open WhatsApp with your message pre-filled so Reet can reply faster.</p>

            {sent ? (
              <div className="p-8 rounded-2xl bg-card border border-primary/30 text-center space-y-3">
                <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
                <p className="font-semibold text-base">Message opened in WhatsApp!</p>
                <p className="text-sm text-muted-foreground">Just hit send in WhatsApp and Reet will get back to you shortly.</p>
                <Button variant="outline" className="rounded-full" onClick={() => setSent(false)}>Send Another</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Your Name *</Label>
                  <Input id="name" placeholder="Priya Sharma" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@email.com" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea id="message" placeholder="Tell Reet what you need — design ideas, order questions, sizing help…"
                    rows={5} value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="rounded-xl resize-none" />
                </div>
                <Button type="submit" className="w-full rounded-full shadow-soft hover:shadow-glow" size="lg">
                  <Send className="h-4 w-4 mr-2" /> Send via WhatsApp
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
