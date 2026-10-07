-- Thesis Journal schema
-- Paste into Supabase → SQL Editor → Run

-- ---------- Projects ----------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title       text not null,
  summary     text default '',
  status      text not null default 'idea'
              check (status in ('idea', 'exploring', 'prototyping', 'done', 'parked')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- Entries ----------
create table if not exists public.entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  project_id  uuid references public.projects(id) on delete set null,
  title       text not null,
  body        text default '',
  kind        text not null default 'note'
              check (kind in ('idea', 'note', 'reference', 'reflection', 'todo')),
  tags        text[] not null default '{}',
  link        text,
  pinned      boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists entries_user_created_idx on public.entries (user_id, created_at desc);
create index if not exists entries_project_idx on public.entries (project_id);
create index if not exists entries_tags_idx on public.entries using gin (tags);

-- ---------- updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists entries_updated_at on public.entries;
create trigger entries_updated_at before update on public.entries
  for each row execute function public.set_updated_at();

-- ---------- Row Level Security: only you can see your rows ----------
alter table public.projects enable row level security;
alter table public.entries  enable row level security;

drop policy if exists "own projects" on public.projects;
create policy "own projects" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own entries" on public.entries;
create policy "own entries" on public.entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
