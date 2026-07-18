-- Allow users to update payment_screenshot and payment_status on their own orders.
-- Without this, supabase silently ignores the update (RLS blocks it, no error returned).
create policy "Users can update payment on their own orders"
  on public.orders for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
