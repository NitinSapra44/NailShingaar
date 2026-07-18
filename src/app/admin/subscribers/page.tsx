'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Mail, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Subscriber {
  id: string;
  email: string;
  discount_code: string;
  subscribed_at: string;
}

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase as any)
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false })
      .then(({ data }: { data: Subscriber[] | null }) => {
        setSubscribers(data ?? []);
        setLoading(false);
      });
  }, []);

  const downloadCSV = () => {
    const rows = [
      ['Email', 'Discount Code', 'Subscribed At'],
      ...subscribers.map((s) => [s.email, s.discount_code, format(new Date(s.subscribed_at), 'dd MMM yyyy HH:mm')]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-foreground">Newsletter Subscribers</h1>
            <p className="text-muted-foreground mt-1">
              {loading ? '…' : `${subscribers.length} subscriber${subscribers.length !== 1 ? 's' : ''}`} collected
            </p>
          </div>
          {subscribers.length > 0 && (
            <Button variant="outline" onClick={downloadCSV} className="gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : subscribers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No subscribers yet. Share your site to get sign-ups!
              </div>
            ) : (
              <div className="divide-y divide-border">
                <div className="grid grid-cols-3 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-muted/40">
                  <span>Email</span>
                  <span>Discount Code</span>
                  <span>Subscribed</span>
                </div>
                {subscribers.map((s) => (
                  <div key={s.id} className="grid grid-cols-3 px-4 py-3 text-sm items-center">
                    <span className="font-medium truncate pr-4">{s.email}</span>
                    <span className="font-mono text-primary font-semibold">{s.discount_code}</span>
                    <span className="text-muted-foreground">{format(new Date(s.subscribed_at), 'dd MMM yyyy')}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
