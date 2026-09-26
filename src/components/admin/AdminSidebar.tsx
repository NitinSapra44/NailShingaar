'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, FolderOpen, ShoppingCart, ArrowLeft, LogOut, Sparkles, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const menuItems = [
  { title: 'Dashboard',  url: '/admin',              icon: LayoutDashboard },
  { title: 'Orders',     url: '/admin/orders',        icon: ShoppingCart },
  { title: 'Products',   url: '/admin/products',      icon: Package },
  { title: 'Categories', url: '/admin/categories',    icon: FolderOpen },
  { title: 'Blog',       url: '/admin/blog',          icon: BookOpen },
];

interface AdminSidebarProps {
  onClose?: () => void;
}

export const AdminSidebar = ({ onClose }: AdminSidebarProps) => {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [pendingEnquiries, setPendingEnquiries] = useState(0);

  useEffect(() => {
    supabase.from('orders').select('id, notes, status').eq('status', 'pending').then(({ data }) => {
      const count = (data ?? []).filter((o) => {
        try { return JSON.parse((o.notes as string) ?? '{}').type === 'custom_design'; } catch { return false; }
      }).length;
      setPendingEnquiries(count);
    });
  }, []);

  const linkCls = (url: string) => cn(
    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium',
    pathname === url
      ? 'bg-primary text-primary-foreground shadow-soft'
      : 'text-muted-foreground hover:bg-pink-light hover:text-primary'
  );

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      <div className="p-6 flex flex-col flex-1">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/" onClick={onClose}>
            <img src="/logo.png" alt="Nail Shingaar by Reet" className="h-14 w-auto object-contain" />
          </Link>
          <p className="text-xs text-muted-foreground mt-2 font-medium uppercase tracking-widest">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="space-y-1 flex-1">
          {menuItems.map((item) => (
            <Link key={item.url} href={item.url} className={linkCls(item.url)} onClick={onClose}>
              <item.icon className="w-4 h-4 shrink-0" />
              {item.title}
            </Link>
          ))}

          <Link href="/admin/enquiries" className={linkCls('/admin/enquiries')} onClick={onClose}>
            <Sparkles className="w-4 h-4 shrink-0" />
            Enquiries
            {pendingEnquiries > 0 && (
              <span className={cn(
                'ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full',
                pathname === '/admin/enquiries'
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-primary text-primary-foreground'
              )}>
                {pendingEnquiries}
              </span>
            )}
          </Link>
        </nav>

        {/* Bottom links */}
        <div className="space-y-1 pt-6 border-t border-border">
          <Link href="/" onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
          <button
            onClick={() => { signOut(); onClose?.(); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};
