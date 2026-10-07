# Thesis Journal

A private journal for thesis ideas and projects. Next.js 15 (App Router, server actions) + Supabase (Postgres, magic-link auth, row-level security), deployable on Vercel.

**What's in it**

- **Entries** — typed as `idea`, `note`, `reference`, `reflection` or `todo`, with tags, an optional link, and pinning
- **Projects** — each with a status (`idea → exploring → prototyping → done / parked`); entries can belong to one
- Search, filter by type / project / tag, and a tag cloud
- Sign-in by email magic link; row-level security means only your rows are ever readable

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor** → paste `supabase/schema.sql` → **Run**.
3. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000` (change to your Vercel URL later)
   - Redirect URLs: add `http://localhost:3000/auth/callback` and `https://YOUR-APP.vercel.app/auth/callback`
4. Sign in once yourself (step 2 below), then optionally **Authentication → Sign In / Providers → turn off "Allow new users to sign up"** so nobody else can create an account.

## 2. Run locally

```bash
cp .env.example .env.local   # fill in URL + anon/publishable key + your email
npm install
npm run dev
```

Open http://localhost:3000, enter your email, click the link in your inbox.

## 3. Deploy to Vercel

1. Push this folder to a GitHub repo.
2. [vercel.com/new](https://vercel.com/new) → import the repo.
3. Add the env vars from `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ALLOWED_EMAIL`).
4. Deploy, then update Supabase's Site URL to the Vercel domain.

## Structure

```
app/
  page.tsx               entry feed, search + filters
  entries/new/           new entry
  entries/[id]/          read view (?edit=1 for edit)
  projects/              project list + quick-add
  projects/[id]/         project page with its entries
  login/, auth/callback/ magic-link sign-in
  actions.ts             all create/update/delete server actions
components/              EntryForm, EntryCard
lib/supabase/            browser + server clients
middleware.ts            session refresh + redirect to /login
supabase/schema.sql      tables, indexes, RLS policies
```

## Customizing

- **Entry types / project statuses** — edit the `check` constraints in `schema.sql` *and* the arrays in `lib/types.ts`.
- **Look** — all styling is in `app/globals.css`; colors and fonts are tokens at the top.
- **Ideas for later** — image uploads via Supabase Storage, Markdown rendering for the body, links between entries, a "moodboard" grid view per project.
