'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
    }
  }, [authLoading, user, router]);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-serif text-3xl text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You don&apos;t have permission to access this page.</p>
          <Link href="/" className="text-primary hover:underline">Go back to store</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <AdminSidebar />
      </div>

      {/* Mobile top bar */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-card sticky top-0 z-40">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <AdminSidebar onClose={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <Link href="/admin">
            <img src="/logo.png" alt="Nail Shingaar" className="h-8 w-auto object-contain" />
          </Link>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest ml-1">Admin</span>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
