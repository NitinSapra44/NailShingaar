import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  primaryKey,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import type { AdapterAccount } from 'next-auth/adapters';

// ─── NextAuth (Auth.js) tables — shape required by @auth/drizzle-adapter ───

export const users = pgTable('users', {
  id: text('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  password: text('password'), // bcrypt hash; null for OAuth-only accounts
  role: text('role').notNull().default('user'), // 'user' | 'admin'
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const accounts = pgTable(
  'accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').notNull().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// ─── App tables ───

export const categories = pgTable('categories', {
  id: text('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable('products', {
  id: text('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  originalPrice: numeric('original_price', { precision: 10, scale: 2 }),
  categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
  imageUrl: text('image_url').notNull(),
  images: text('images').array().notNull().default([]),
  videos: text('videos').array().notNull().default([]),
  sizes: text('sizes').array().notNull().default(['XS', 'S', 'M', 'L']),
  stock: integer('stock').notNull().default(0),
  isFeatured: boolean('is_featured').notNull().default(false),
  isNew: boolean('is_new').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const productCategories = pgTable(
  'product_categories',
  {
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    categoryId: text('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
  },
  (pc) => ({
    pk: primaryKey({ columns: [pc.productId, pc.categoryId] }),
  })
);

export const orderStatusValues = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;
export type OrderStatus = (typeof orderStatusValues)[number];

export const orders = pgTable('orders', {
  id: text('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  status: text('status').$type<OrderStatus>().notNull().default('pending'),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  shippingAddress: text('shipping_address').notNull(),
  shippingCity: text('shipping_city').notNull(),
  shippingPhone: text('shipping_phone').notNull(),
  shippingName: text('shipping_name').notNull(),
  nailLength: text('nail_length'),
  nailShape: text('nail_shape'),
  colorPreference: text('color_preference'),
  nailPhotos: text('nail_photos').array().notNull().default([]),
  paymentScreenshot: text('payment_screenshot'),
  paymentStatus: text('payment_status').notNull().default('pending'),
  trackingNumber: text('tracking_number'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: text('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orderId: text('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('product_id').references(() => products.id, { onDelete: 'set null' }),
  productName: text('product_name').notNull(),
  productImage: text('product_image'),
  size: text('size').notNull(),
  quantity: integer('quantity').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const cartItems = pgTable(
  'cart_items',
  {
    id: text('id')
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    size: text('size').notNull(),
    quantity: integer('quantity').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniq: uniqueIndex('cart_items_user_product_size_key').on(t.userId, t.productId, t.size),
  })
);

export const wishlist = pgTable(
  'wishlist',
  {
    id: text('id')
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniq: uniqueIndex('wishlist_user_product_key').on(t.userId, t.productId),
  })
);

export const blogPosts = pgTable('blog_posts', {
  id: text('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content'),
  coverImageUrl: text('cover_image_url'),
  published: boolean('published').notNull().default(false),
  metaDescription: text('meta_description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
