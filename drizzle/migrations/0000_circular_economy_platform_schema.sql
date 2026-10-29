create type public.app_role as enum ('admin', 'moderator', 'user');
create type public.listing_type as enum ('sell', 'donate');
create type public.listing_status as enum ('draft', 'active', 'paused', 'sold', 'donated', 'removed');
create type public.item_condition as enum ('like_new', 'light_damage', 'moderate_damage', 'heavy_damage', 'broken');
create type public.reservation_status as enum ('pending', 'accepted', 'declined', 'completed', 'cancelled');
create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');
create type public.report_target as enum ('listing', 'message', 'user');
create type public.centre_type as enum ('ngo', 'donation_centre', 'recycling_centre', 'kabadiwala');

-- profiles is one of the two tables allowed to reference auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  bio text,
  pin_code text,
  preferred_language text not null default 'en',
  notify_messages boolean not null default true,
  notify_reservations boolean not null default true,
  notify_listings boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- roles live in their own table, never on profiles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, 'member'), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- AI analysis history (user_id is a plain uuid; joins happen in app code)
create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  image_path text,
  item_name text not null,
  category text not null,
  material text not null,
  condition_label text not null,
  condition_score integer not null,
  best_action text not null,
  actions jsonb not null,
  summary text not null,
  confidence integer,
  needs_more_info boolean not null default false,
  created_at timestamptz not null default now()
);
create index analyses_user_created_idx on public.analyses (user_id, created_at desc);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  type public.listing_type not null default 'sell',
  title text not null,
  description text not null default '',
  category text not null,
  condition public.item_condition not null,
  price numeric(12,2),
  location_text text,
  pin_code text,
  status public.listing_status not null default 'draft',
  analysis_id uuid references public.analyses(id) on delete set null,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index listings_browse_idx on public.listings (status, type, created_at desc);
create index listings_owner_idx on public.listings (owner_id, created_at desc);
create index listings_category_idx on public.listings (category);

create table public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index listing_photos_listing_idx on public.listing_photos (listing_id, sort_order);

create table public.favourites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  requester_id uuid not null,
  status public.reservation_status not null default 'pending',
  message text,
  pickup_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index reservations_pending_unique on public.reservations (listing_id, requester_id) where status = 'pending';
create trigger reservations_updated_at before update on public.reservations
for each row execute function public.set_updated_at();

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null,
  seller_id uuid not null,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index messages_conversation_idx on public.messages (conversation_id, created_at);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null,
  title text not null,
  body text,
  data jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

-- Verified centres are entered by admins only; nothing is fabricated.
create table public.centres (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.centre_type not null,
  description text,
  address text not null,
  city text,
  pin_code text,
  phone text,
  hours text,
  accepted_categories text[] not null default '{}',
  website text,
  verified boolean not null default false,
  created_by uuid,
  created_at timestamptz not null default now()
);
create index centres_pin_idx on public.centres (pin_code);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null,
  target_type public.report_target not null,
  target_id uuid not null,
  reason text not null,
  details text,
  status public.report_status not null default 'open',
  resolved_by uuid,
  resolution_note text,
  created_at timestamptz not null default now()
);
create index reports_status_idx on public.reports (status, created_at desc);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null,
  action text not null,
  target_type text not null,
  target_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_created_idx on public.audit_logs (created_at desc);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============= GRANTS (Data API needs explicit grants) =============
grant select on public.profiles to anon, authenticated;
grant insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

grant select, insert, update, delete on public.analyses to authenticated;
grant all on public.analyses to service_role;

grant select on public.listings to anon, authenticated;
grant insert, update, delete on public.listings to authenticated;
grant all on public.listings to service_role;

grant select on public.listing_photos to anon, authenticated;
grant insert, update, delete on public.listing_photos to authenticated;
grant all on public.listing_photos to service_role;

grant select, insert, update, delete on public.favourites to authenticated;
grant all on public.favourites to service_role;

grant select, insert, update, delete on public.reservations to authenticated;
grant all on public.reservations to service_role;

grant select, insert, update on public.conversations to authenticated;
grant all on public.conversations to service_role;

grant select, insert, update on public.messages to authenticated;
grant all on public.messages to service_role;

grant select, insert, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;

grant select on public.centres to anon, authenticated;
grant insert, update, delete on public.centres to authenticated;
grant all on public.centres to service_role;

grant select, insert, update, delete on public.reports to authenticated;
grant all on public.reports to service_role;

grant select on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;

grant insert on public.contact_messages to anon, authenticated;
grant select on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;

-- ============= RLS =============
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.analyses enable row level security;
alter table public.listings enable row level security;
alter table public.listing_photos enable row level security;
alter table public.favourites enable row level security;
alter table public.reservations enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.centres enable row level security;
alter table public.reports enable row level security;
alter table public.audit_logs enable row level security;
alter table public.contact_messages enable row level security;

-- profiles
create policy "Profiles are publicly readable" on public.profiles for select to anon, authenticated using (true);
create policy "Users insert own profile" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "Users update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "Users delete own profile" on public.profiles for delete to authenticated using (id = auth.uid());

-- user_roles
create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "Admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- analyses (owner-only)
create policy "Users manage own analyses" on public.analyses for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- listings
create policy "Active listings are public" on public.listings for select to anon, authenticated using (status = 'active');
create policy "Owners read own listings" on public.listings for select to authenticated using (owner_id = auth.uid());
create policy "Admins read all listings" on public.listings for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Owners create listings" on public.listings for insert to authenticated with check (owner_id = auth.uid());
create policy "Owners update own listings" on public.listings for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Admins moderate listings" on public.listings for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Owners delete own listings" on public.listings for delete to authenticated using (owner_id = auth.uid());
create policy "Admins delete listings" on public.listings for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- listing photos
create policy "Listing photos are public" on public.listing_photos for select to anon, authenticated using (true);
create policy "Owners manage photos" on public.listing_photos for insert to authenticated
  with check (exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid()));
create policy "Owners update photos" on public.listing_photos for update to authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid()));
create policy "Owners delete photos" on public.listing_photos for delete to authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid()));

-- favourites
create policy "Users manage own favourites" on public.favourites for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- reservations (requester + listing owner)
create policy "Participants read reservations" on public.reservations for select to authenticated
  using (requester_id = auth.uid() or exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid()));
create policy "Buyers create reservations" on public.reservations for insert to authenticated
  with check (requester_id = auth.uid() and exists (
    select 1 from public.listings l where l.id = listing_id and l.owner_id <> auth.uid() and l.status = 'active'));
create policy "Participants update reservations" on public.reservations for update to authenticated
  using (requester_id = auth.uid() or exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid()))
  with check (requester_id = auth.uid() or exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid()));

-- conversations
create policy "Participants read conversations" on public.conversations for select to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid());
create policy "Buyers start conversations" on public.conversations for insert to authenticated
  with check (buyer_id = auth.uid() and exists (
    select 1 from public.listings l where l.id = listing_id and l.owner_id = seller_id and l.owner_id <> buyer_id and l.status = 'active'));
create policy "Participants update conversations" on public.conversations for update to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid());

-- messages
create policy "Participants read messages" on public.messages for select to authenticated
  using (exists (select 1 from public.conversations c where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())));
create policy "Participants send messages" on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and exists (select 1 from public.conversations c where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())));
create policy "Recipient marks read" on public.messages for update to authenticated
  using (exists (select 1 from public.conversations c where c.id = conversation_id and c.buyer_id <> sender_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())));

-- notifications
create policy "Users manage own notifications" on public.notifications for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- centres
create policy "Verified centres are public" on public.centres for select to anon, authenticated using (verified = true);
create policy "Admins and creators read unverified" on public.centres for select to authenticated
  using (created_by = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage centres" on public.centres for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- reports
create policy "Users report content" on public.reports for insert to authenticated
  with check (reporter_id = auth.uid());
create policy "Users read own reports" on public.reports for select to authenticated using (reporter_id = auth.uid());
create policy "Admins read all reports" on public.reports for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update reports" on public.reports for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- audit logs
create policy "Admins read audit logs" on public.audit_logs for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins write audit logs" on public.audit_logs for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));

-- contact messages
create policy "Anyone can send a contact message" on public.contact_messages for insert to anon, authenticated with check (true);
create policy "Admins read contact messages" on public.contact_messages for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- triggers for updated_at
create trigger listings_updated_at before update on public.listings
for each row execute function public.set_updated_at();
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();