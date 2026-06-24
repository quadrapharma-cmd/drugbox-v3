-- ============================================================
-- Drugbox — Migration 007: Posts, Reactions, Comments
-- Powers the Home Feed.
-- ============================================================

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text,
  category text not null default 'general' check (category in ('general','regulatory','market','innovation','job')),
  image_urls text[],          -- array of image URLs (multi-photo posts)
  file_url text,
  file_name text,
  created_at timestamptz not null default now(),

  constraint posts_not_empty check (
    coalesce(body,'') != '' or image_urls is not null or file_url is not null
  )
);

create index idx_posts_user_id on public.posts(user_id);
create index idx_posts_category on public.posts(category);
create index idx_posts_created_at on public.posts(created_at desc);

create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null default 'like' check (kind in ('like','celebrate','support','insightful')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id)   -- one reaction per user per post (changing kind = update, not duplicate)
);

create index idx_reactions_post_id on public.reactions(post_id);
create index idx_reactions_user_id on public.reactions(user_id);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create index idx_comments_post_id on public.comments(post_id);
create index idx_comments_user_id on public.comments(user_id);

-- ============================================================
-- ROW LEVEL SECURITY — posts
-- ============================================================
alter table public.posts enable row level security;

create policy "posts_select_all_authenticated"
  on public.posts for select
  to authenticated
  using (true);

create policy "posts_insert_self_only"
  on public.posts for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "posts_update_own_only"
  on public.posts for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "posts_delete_own_only"
  on public.posts for delete
  to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- ROW LEVEL SECURITY — reactions
-- ============================================================
alter table public.reactions enable row level security;

create policy "reactions_select_all_authenticated"
  on public.reactions for select
  to authenticated
  using (true);

create policy "reactions_insert_self_only"
  on public.reactions for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "reactions_update_own_only"
  on public.reactions for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "reactions_delete_own_only"
  on public.reactions for delete
  to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- ROW LEVEL SECURITY — comments
-- ============================================================
alter table public.comments enable row level security;

create policy "comments_select_all_authenticated"
  on public.comments for select
  to authenticated
  using (true);

create policy "comments_insert_self_only"
  on public.comments for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "comments_delete_own_only"
  on public.comments for delete
  to authenticated
  using (user_id = auth.uid());
