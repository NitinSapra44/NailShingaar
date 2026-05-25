-- Nail Shingaar upgrade: questionnaire fields, payment tracking, admin policies, storage

-- 1. Extend orders table with nail sizing questionnaire + payment fields
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS nail_length       TEXT,
  ADD COLUMN IF NOT EXISTS nail_shape        TEXT,
  ADD COLUMN IF NOT EXISTS color_preference  TEXT,
  ADD COLUMN IF NOT EXISTS nail_photos       TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS payment_screenshot TEXT,
  ADD COLUMN IF NOT EXISTS payment_status    TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS tracking_number   TEXT,
  ADD COLUMN IF NOT EXISTS notes             TEXT;

-- 2. Allow admins to view ALL orders (existing policy only allows own orders)
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Allow admins to update order status / payment_status / tracking
CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Allow admins to view all order items
CREATE POLICY "Admins can view all order items"
  ON public.order_items FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Storage buckets for nail photos and payment screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'nail-photos',
    'nail-photos',
    false,
    10485760,  -- 10 MB
    ARRAY['image/jpeg','image/png','image/webp','image/heic','image/heif']
  ),
  (
    'payment-screenshots',
    'payment-screenshots',
    false,
    5242880,   -- 5 MB
    ARRAY['image/jpeg','image/png','image/webp']
  )
ON CONFLICT (id) DO NOTHING;

-- 6. Storage RLS: authenticated users can upload to their own folder
CREATE POLICY "Users upload nail photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'nail-photos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users read own nail photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'nail-photos'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.has_role(auth.uid(), 'admin')
    )
  );

CREATE POLICY "Users upload payment screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'payment-screenshots'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users read own payment screenshots"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payment-screenshots'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.has_role(auth.uid(), 'admin')
    )
  );

-- 7. Admins can read ALL storage objects in both buckets
CREATE POLICY "Admins read all nail photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'nail-photos'
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins read all payment screenshots"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payment-screenshots'
    AND public.has_role(auth.uid(), 'admin')
  );
