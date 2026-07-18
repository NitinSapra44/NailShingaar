create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  discount_code text not null default 'WELCOME15',
  subscribed_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

-- Anyone can subscribe (insert their email)
create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert
  with check (true);

-- Only admin can read the subscriber list
create policy "Admin can read subscribers"
  on public.newsletter_subscribers for select
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );
