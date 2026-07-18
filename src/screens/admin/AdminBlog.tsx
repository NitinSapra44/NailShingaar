'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Loader2, Upload, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { BlogPost } from '@/types';

export const AdminBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [deletePost, setDeletePost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageFileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image_url: '',
    meta_description: '',
    published: false,
  });

  useEffect(() => { fetchPosts(); }, []);

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title,
        slug: editing.slug,
        excerpt: editing.excerpt || '',
        content: editing.content || '',
        cover_image_url: editing.cover_image_url || '',
        meta_description: editing.meta_description || '',
        published: editing.published,
      });
    } else {
      setForm({ title: '', slug: '', excerpt: '', content: '', cover_image_url: '', meta_description: '', published: false });
    }
  }, [editing]);

  const fetchPosts = async () => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).from('blog_posts').select('*').order('created_at', { ascending: false });
    if (error) toast.error('Failed to load posts');
    else setPosts((data as BlogPost[]) || []);
    setLoading(false);
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleTitleChange = (title: string) => {
    setForm((f) => ({ ...f, title, slug: editing ? f.slug : generateSlug(title) }));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const path = `blog/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, cover_image_url: url }));
    } catch (err: any) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error('Title and slug are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim() || null,
        content: form.content.trim() || null,
        cover_image_url: form.cover_image_url || null,
        meta_description: form.meta_description.trim() || null,
        published: form.published,
        updated_at: new Date().toISOString(),
      };

      if (editing) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from('blog_posts').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Post updated!');
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from('blog_posts').insert([payload]);
        if (error) throw error;
        toast.success('Post created!');
      }
      setIsFormOpen(false);
      setEditing(null);
      fetchPosts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePost) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('blog_posts').delete().eq('id', deletePost.id);
    if (error) toast.error('Failed to delete post');
    else { toast.success('Post deleted'); fetchPosts(); }
    setDeletePost(null);
  };

  const togglePublish = async (post: BlogPost) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('blog_posts').update({ published: !post.published }).eq('id', post.id);
    if (error) toast.error('Failed to update');
    else fetchPosts();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-foreground">Blog Posts</h1>
            <p className="text-muted-foreground mt-1">Write posts to boost your SEO</p>
          </div>
          <Button onClick={() => { setEditing(null); setIsFormOpen(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> New Post
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No posts yet. Write your first blog post!
              </div>
            ) : (
              <div className="divide-y divide-border">
                {posts.map((post) => (
                  <div key={post.id} className="flex items-center gap-4 p-4">
                    {post.cover_image_url
                      ? <img src={post.cover_image_url} alt={post.title} className="w-16 h-16 object-cover rounded-xl shrink-0" />
                      : <div className="w-16 h-16 bg-muted rounded-xl shrink-0 flex items-center justify-center text-muted-foreground text-xs text-center px-1">No image</div>}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{post.title}</p>
                        <Badge className={post.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                          {post.published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">/blog/{post.slug}</p>
                      {post.excerpt && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{post.excerpt}</p>}
                      <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(post.created_at), 'dd MMM yyyy')}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" title={post.published ? 'Unpublish' : 'Publish'} onClick={() => togglePublish(post)}>
                        {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(post); setIsFormOpen(true); }}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletePost(post)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form dialog */}
        <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditing(null); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                {editing ? 'Edit Post' : 'New Blog Post'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="How To Make Press-On Nails Last 2+ Weeks" />
              </div>

              <div className="space-y-2">
                <Label>Slug * <span className="text-muted-foreground text-xs">(URL: /blog/your-slug)</span></Label>
                <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="how-to-make-press-on-nails-last" />
              </div>

              <div className="space-y-2">
                <Label>Cover Image</Label>
                <input type="file" accept="image/*" ref={imageFileRef} className="hidden" onChange={handleImageChange} />
                {form.cover_image_url ? (
                  <div className="relative w-full h-40">
                    <img src={form.cover_image_url} alt="Cover" className="w-full h-40 object-cover rounded-xl border" />
                    <button type="button" onClick={() => { setForm((f) => ({ ...f, cover_image_url: '' })); if (imageFileRef.current) imageFileRef.current.value = ''; }}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => imageFileRef.current?.click()} disabled={uploadingImage}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors text-sm">
                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload Cover Image
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <Label>Excerpt <span className="text-muted-foreground text-xs">(short summary shown on homepage & blog list)</span></Label>
                <Textarea value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  rows={2} placeholder="A short description that hooks readers in (1–2 sentences)." />
              </div>

              <div className="space-y-2">
                <Label>Content <span className="text-muted-foreground text-xs">(separate paragraphs with a blank line)</span></Label>
                <Textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  rows={12} placeholder="Write your full blog post here...&#10;&#10;Start a new paragraph by leaving a blank line between sections." className="font-mono text-sm" />
              </div>

              <div className="space-y-2">
                <Label>Meta Description <span className="text-muted-foreground text-xs">(for Google — keep under 160 characters)</span></Label>
                <Textarea value={form.meta_description} onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))}
                  rows={2} placeholder="Describe what this post is about for search engines." />
                <p className="text-xs text-muted-foreground">{form.meta_description.length}/160</p>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="published" checked={form.published}
                  onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                  className="w-4 h-4 accent-primary" />
                <Label htmlFor="published" className="cursor-pointer">Publish immediately (visible on site)</Label>
              </div>

              <div className="flex gap-4 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setEditing(null); }}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editing ? 'Update Post' : 'Create Post'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deletePost} onOpenChange={() => setDeletePost(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Post</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletePost?.title}"? This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};
