import type { categories, products, orders, orderItems, blogPosts } from '@/lib/db/schema';

type CategoryRow = typeof categories.$inferSelect;
type ProductRow = typeof products.$inferSelect;
type OrderRow = typeof orders.$inferSelect;
type OrderItemRow = typeof orderItems.$inferSelect;
type BlogPostRow = typeof blogPosts.$inferSelect;

// Drizzle/pg return numeric columns as strings — the frontend types expect `number`.
const num = (v: string | null): number | null => (v === null ? null : Number(v));

export function serializeCategory(c: CategoryRow) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image_url: c.imageUrl,
    created_at: c.createdAt.toISOString(),
  };
}

export function serializeProduct(p: ProductRow, categoryIds?: string[]) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: num(p.price)!,
    original_price: num(p.originalPrice),
    category_id: p.categoryId,
    category_ids: categoryIds,
    image_url: p.imageUrl,
    images: p.images,
    videos: p.videos,
    sizes: p.sizes,
    stock: p.stock,
    is_featured: p.isFeatured,
    is_new: p.isNew,
    created_at: p.createdAt.toISOString(),
    updated_at: p.updatedAt.toISOString(),
  };
}

export function serializeOrderItem(i: OrderItemRow) {
  return {
    id: i.id,
    order_id: i.orderId,
    product_id: i.productId,
    product_name: i.productName,
    product_image: i.productImage,
    size: i.size,
    quantity: i.quantity,
    price: num(i.price)!,
    created_at: i.createdAt.toISOString(),
  };
}

export function serializeOrder(o: OrderRow, items?: OrderItemRow[]) {
  return {
    id: o.id,
    user_id: o.userId,
    status: o.status,
    total: num(o.total)!,
    shipping_address: o.shippingAddress,
    shipping_city: o.shippingCity,
    shipping_phone: o.shippingPhone,
    shipping_name: o.shippingName,
    nail_length: o.nailLength,
    nail_shape: o.nailShape,
    color_preference: o.colorPreference,
    nail_photos: o.nailPhotos,
    payment_screenshot: o.paymentScreenshot,
    payment_status: o.paymentStatus,
    tracking_number: o.trackingNumber,
    notes: o.notes,
    created_at: o.createdAt.toISOString(),
    updated_at: o.updatedAt.toISOString(),
    items: items?.map(serializeOrderItem),
  };
}

export function serializeBlogPost(b: BlogPostRow) {
  return {
    id: b.id,
    title: b.title,
    slug: b.slug,
    excerpt: b.excerpt,
    content: b.content,
    cover_image_url: b.coverImageUrl,
    published: b.published,
    meta_description: b.metaDescription,
    created_at: b.createdAt.toISOString(),
    updated_at: b.updatedAt.toISOString(),
  };
}
