import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const posts = [
  {
    title: 'How To Make Press-On Nails Last 2+ Weeks',
    excerpt:
      "The secret to long-lasting press-on nails isn't magic — it's prep. Follow these simple steps to keep your set looking salon-fresh for weeks.",
    image:
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=400&fit=crop&q=80',
    date: 'May 2025',
    href: '/how-to-order',
  },
  {
    title: 'The Perfect Nail Shape For Your Hand Type',
    excerpt:
      'Round, almond, coffin, square — picking the right shape can make your fingers look longer and your hands more elegant.',
    image:
      'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&h=400&fit=crop&q=80',
    date: 'Apr 2025',
    href: '/size-guide',
  },
  {
    title: 'Bridal Nail Trends For 2025 Weddings',
    excerpt:
      'From French tips to intricate meenakari-inspired designs — the 2025 bridal nail trends are everything you need for your big day.',
    image:
      'https://images.unsplash.com/photo-1610992015762-45dca7fa3a85?w=600&h=400&fit=crop&q=80',
    date: 'Mar 2025',
    href: '/categories/indian-bridal-festive',
  },
];

const BlogSection = () => {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-muted-foreground uppercase mb-2">Tips & Trends</p>
            <h2 className="font-display text-4xl md:text-6xl">
              The Latest in <span className="text-gradient">Nail Trends</span>
            </h2>
          </div>
          <Link
            href="/size-guide"
            className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline group shrink-0"
          >
            View All
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <Link
              key={post.title}
              href={post.href}
              className="group rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 bg-background animate-fade-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="aspect-[3/2] overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase mb-2">
                  {post.date}
                </p>
                <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-tight mb-2">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
