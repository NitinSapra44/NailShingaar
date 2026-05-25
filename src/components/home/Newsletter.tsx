import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast({
      title: 'Welcome to the family! 💅',
      description: 'You\'ll receive exclusive offers and updates soon.',
    });
    
    setEmail('');
    setLoading(false);
  };

  return (
    <section className="py-20 bg-gradient-card relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 text-primary/20">
        <Sparkles className="h-16 w-16" />
      </div>
      <div className="absolute bottom-10 right-10 text-lavender/30">
        <Sparkles className="h-20 w-20" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
            Join the <span className="text-gradient">Nail Shingaar</span> Family
          </h2>
          <p className="text-muted-foreground mb-8">
            Subscribe to get 15% off your first order plus exclusive access to new releases, styling tips, and special promotions.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-full px-6 h-12"
              required
            />
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full px-8 h-12 shadow-soft hover:shadow-glow transition-shadow"
            >
              {loading ? (
                'Subscribing...'
              ) : (
                <>
                  Subscribe
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-4">
            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
