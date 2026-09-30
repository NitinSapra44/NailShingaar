-- Razorpay online payments.
--
-- 1. Columns to link an order to its Razorpay order/payment.
-- 2. Lock down what customers can write on their own orders. The earlier policy
--    "Users can update payment on their own orders" lets a customer update ANY
--    column, so from the browser console they could set payment_status =
--    'confirmed' or lower the quoted total on a custom order before paying.
--    Payment confirmation must only ever come from the server (service role),
--    after Razorpay's signature has been verified, or from an admin.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS razorpay_order_id   TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS paid_at             TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS orders_razorpay_payment_id_key
  ON public.orders (razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_razorpay_order_id_idx
  ON public.orders (razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;

-- Same rule the app uses: notes is JSON with type = 'custom_design'.
CREATE OR REPLACE FUNCTION public.is_custom_design_order(_notes TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN coalesce(_notes::jsonb ->> 'type', '') = 'custom_design';
EXCEPTION WHEN others THEN
  RETURN false;                                   -- notes isn't JSON
END;
$$;

-- Requests from the website run as 'anon' or 'authenticated'. The server's
-- service-role key, the SQL editor and dashboard run as other roles.
CREATE OR REPLACE FUNCTION public.guard_order_customer_writes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF current_user NOT IN ('anon', 'authenticated') THEN
    RETURN NEW;                                   -- server / SQL editor
  END IF;
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;                                   -- Reet in the admin panel
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.payment_status NOT IN ('pending', 'screenshot_uploaded')
       OR NEW.razorpay_order_id IS NOT NULL
       OR NEW.razorpay_payment_id IS NOT NULL
       OR NEW.paid_at IS NOT NULL THEN
      RAISE EXCEPTION 'Not allowed to set payment fields on a new order'
        USING ERRCODE = '42501';
    END IF;
    -- Custom-design orders are priced by Reet's quote (admin only), so a
    -- customer can't create one that already carries a price.
    IF public.is_custom_design_order(NEW.notes) AND NEW.total <> 0 THEN
      RAISE EXCEPTION 'Custom design orders start unpriced'
        USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE by a customer: only the manual-UPI screenshot flow is allowed,
  -- i.e. attach a screenshot and move pending -> screenshot_uploaded.
  IF (to_jsonb(NEW) - 'payment_screenshot' - 'payment_status' - 'updated_at')
     IS DISTINCT FROM
     (to_jsonb(OLD) - 'payment_screenshot' - 'payment_status' - 'updated_at') THEN
    RAISE EXCEPTION 'Customers can only attach a payment screenshot to an order'
      USING ERRCODE = '42501';
  END IF;
  IF NEW.payment_status IS DISTINCT FROM OLD.payment_status
     AND NOT (OLD.payment_status = 'pending' AND NEW.payment_status = 'screenshot_uploaded') THEN
    RAISE EXCEPTION 'Customers cannot change payment status'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_order_customer_writes ON public.orders;
CREATE TRIGGER guard_order_customer_writes
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.guard_order_customer_writes();

-- 3. The server prices an order from its order_items when payment starts, so
--    customers must not add or change items once that has happened.
CREATE OR REPLACE FUNCTION public.guard_order_items_customer_writes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  parent public.orders;
BEGIN
  IF current_user NOT IN ('anon', 'authenticated') OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  SELECT * INTO parent FROM public.orders WHERE id = NEW.order_id;
  IF parent.razorpay_order_id IS NOT NULL OR parent.payment_status = 'confirmed' THEN
    RAISE EXCEPTION 'Items cannot be changed once payment has started'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_order_items_customer_writes ON public.order_items;
CREATE TRIGGER guard_order_items_customer_writes
  BEFORE INSERT OR UPDATE ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.guard_order_items_customer_writes();
