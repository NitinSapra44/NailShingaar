import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, Plus, X, Upload, Play } from 'lucide-react';
import type { Product, Category } from '@/types';

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

async function uploadToStorage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}

export const ProductForm = ({ product, onSuccess, onCancel }: ProductFormProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingExtra, setUploadingExtra] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videos, setVideos] = useState<string[]>(product?.videos ?? []);
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(String(product?.price ?? ''));
  const [originalPrice, setOriginalPrice] = useState(String(product?.original_price ?? ''));
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '');
  const [extraImages, setExtraImages] = useState<string[]>(product?.images ?? []);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [isNew, setIsNew] = useState(product?.is_new ?? false);

  const mainFileRef = useRef<HTMLInputElement>(null);
  const extraFileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      setCategories(data ?? []);
    });

    if (product) {
      (supabase as any)
        .from('product_categories')
        .select('category_id')
        .eq('product_id', product.id)
        .then(({ data }: { data: { category_id: string }[] | null }) => {
          setSelectedCategories((data ?? []).map((r) => r.category_id));
        });
    }
  }, [product]);

  const generateSlug = (val: string) =>
    val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const addExtraImage = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    setExtraImages((prev) => [...prev, url]);
    setNewImageUrl('');
  };

  const removeExtraImage = (i: number) => {
    setExtraImages((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleMainFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMain(true);
    try {
      const url = await uploadToStorage(file);
      setImageUrl(url);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingMain(false);
      e.target.value = '';
    }
  };

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploadingVideo(true);
    try {
      const urls = await Promise.all(files.map(async (file) => {
        const ext = file.name.split('.').pop() ?? 'mp4';
        const path = `products/videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: false });
        if (error) throw error;
        return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
      }));
      setVideos((prev) => [...prev, ...urls]);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Video upload failed');
    } finally {
      setUploadingVideo(false);
      e.target.value = '';
    }
  };

  const handleExtraFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploadingExtra(true);
    try {
      const urls = await Promise.all(files.map(uploadToStorage));
      setExtraImages((prev) => [...prev, ...urls]);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingExtra(false);
      e.target.value = '';
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim() || !imageUrl.trim() || !price) {
      toast.error('Name, slug, price and main image are required');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        price: Number.parseFloat(price),
        original_price: originalPrice ? Number.parseFloat(originalPrice) : null,
        image_url: imageUrl.trim(),
        images: extraImages,
        videos,
        is_featured: isFeatured,
        is_new: isNew,
        category_id: selectedCategories[0] ?? null,
      };

      let productId: string;

      if (product) {
        const { error } = await supabase.from('products').update(productData).eq('id', product.id);
        if (error) throw error;
        productId = product.id;
        toast.success('Product updated!');
      } else {
        const { data, error } = await supabase.from('products').insert(productData).select().single();
        if (error) throw error;
        productId = data.id;
        toast.success('Product created!');
      }

      await (supabase as any).from('product_categories').delete().eq('product_id', productId);
      if (selectedCategories.length > 0) {
        await (supabase as any).from('product_categories').insert(
          selectedCategories.map((category_id) => ({ product_id: productId, category_id }))
        );
      }

      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save product';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">

      {/* Name + slug */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Product Name *</Label>
          <Input value={name} placeholder="Kundan Bridal Set"
            onChange={(e) => {
              setName(e.target.value);
              if (!product) setSlug(generateSlug(e.target.value));
            }} />
        </div>
        <div className="space-y-1.5">
          <Label>Slug *</Label>
          <Input value={slug} placeholder="kundan-bridal-set"
            onChange={(e) => setSlug(e.target.value)} />
        </div>
      </div>

      {/* Price */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Price (₹) *</Label>
          <Input type="number" value={price} placeholder="999"
            onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Original Price (₹) <span className="text-muted-foreground font-normal">— for discount badge</span></Label>
          <Input type="number" value={originalPrice} placeholder="1299"
            onChange={(e) => setOriginalPrice(e.target.value)} />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea value={description} rows={3} className="resize-none rounded-xl"
          placeholder="Describe this nail set…"
          onChange={(e) => setDescription(e.target.value)} />
      </div>

      {/* Main image */}
      <div className="space-y-2">
        <Label>Main Image *</Label>
        <div className="flex gap-2">
          <Input value={imageUrl} placeholder="https://… or upload below"
            onChange={(e) => setImageUrl(e.target.value)}
            className="flex-1" />
          <input
            ref={mainFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleMainFileChange}
          />
          <Button type="button" variant="outline" className="rounded-xl shrink-0"
            disabled={uploadingMain}
            onClick={() => mainFileRef.current?.click()}>
            {uploadingMain
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <><Upload className="h-4 w-4 mr-1" /> Upload</>}
          </Button>
        </div>
        {imageUrl && (
          <div className="relative inline-block">
            <img src={imageUrl} alt="preview" className="h-24 w-24 rounded-xl object-cover border border-border" />
            <button type="button" onClick={() => setImageUrl('')}
              className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center shadow">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Extra images */}
      <div className="space-y-2">
        <Label>Additional Images</Label>
        <div className="flex gap-2 flex-wrap">
          {extraImages.map((url, i) => (
            <div key={url + i} className="relative">
              <img src={url} alt="" className="h-16 w-16 rounded-xl object-cover border border-border" />
              <button type="button" onClick={() => removeExtraImage(i)}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center shadow">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={newImageUrl} placeholder="Paste URL and click Add"
            onChange={(e) => setNewImageUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addExtraImage(); } }}
            className="rounded-xl flex-1" />
          <Button type="button" variant="outline" className="rounded-xl shrink-0" onClick={addExtraImage}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
          <input
            ref={extraFileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleExtraFileChange}
          />
          <Button type="button" variant="outline" className="rounded-xl shrink-0"
            disabled={uploadingExtra}
            onClick={() => extraFileRef.current?.click()}>
            {uploadingExtra
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <><Upload className="h-4 w-4 mr-1" /> Upload</>}
          </Button>
        </div>
      </div>

      {/* Videos */}
      <div className="space-y-2">
        <Label>Product Videos <span className="text-muted-foreground font-normal">(optional — shown in carousel)</span></Label>
        <div className="flex gap-2 flex-wrap">
          {videos.map((url, i) => (
            <div key={url + i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center">
              <Play className="h-6 w-6 text-primary" />
              <span className="absolute bottom-0.5 left-0 right-0 text-[9px] text-center text-muted-foreground truncate px-1">
                {url.split('/').pop()}
              </span>
              <button type="button" onClick={() => setVideos((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center shadow">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newVideoUrl}
            placeholder="Paste direct video URL (.mp4, YouTube, etc.) and click Add"
            onChange={(e) => setNewVideoUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const url = newVideoUrl.trim();
                if (url) { setVideos((prev) => [...prev, url]); setNewVideoUrl(''); }
              }
            }}
            className="rounded-xl flex-1"
          />
          <Button type="button" variant="outline" className="rounded-xl shrink-0"
            onClick={() => {
              const url = newVideoUrl.trim();
              if (url) { setVideos((prev) => [...prev, url]); setNewVideoUrl(''); }
            }}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
          <input ref={videoFileRef} type="file" accept="video/*" multiple className="hidden" onChange={handleVideoFileChange} />
          <Button type="button" variant="outline" className="rounded-xl shrink-0"
            disabled={uploadingVideo}
            onClick={() => videoFileRef.current?.click()}>
            {uploadingVideo
              ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Uploading…</>
              : <><Upload className="h-4 w-4 mr-1" /> Upload</>}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Paste a URL or upload a file. For large videos, paste a direct link to avoid upload limits.</p>
      </div>

      {/* Categories (multi-select) */}
      <div className="space-y-2">
        <Label>Categories <span className="text-muted-foreground font-normal">(select all that apply)</span></Label>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((cat) => (
            <label key={cat.id}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                selectedCategories.includes(cat.id)
                  ? 'border-primary bg-pink-light text-primary'
                  : 'border-border hover:border-primary/40 bg-card'
              }`}>
              <Checkbox
                checked={selectedCategories.includes(cat.id)}
                onCheckedChange={() => toggleCategory(cat.id)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="text-sm font-medium">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Flags */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <Switch id="is_featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
          <Label htmlFor="is_featured">Featured on homepage</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="is_new" checked={isNew} onCheckedChange={setIsNew} />
          <Label htmlFor="is_new">New Arrival badge</Label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2 border-t border-border">
        <Button type="button" variant="outline" className="rounded-full" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading} className="rounded-full px-8">
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};
