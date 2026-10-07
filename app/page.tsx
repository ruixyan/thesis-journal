import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EntryCard from "@/components/EntryCard";
import { ENTRY_KINDS, type Entry } from "@/lib/types";

type Search = { q?: string; kind?: string; tag?: string; project?: string };

export default async function Home({ searchParams }: { searchParams: Promise<Search> }) {
  const { q, kind, tag, project } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("entries")
    .select("*, projects(id, title)")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (q) {
    // Strip characters that would break PostgREST's or() syntax
    const term = q.replace(/[,()%*]/g, " ").trim();
    if (term) query = query.or(`title.ilike.%${term}%,body.ilike.%${term}%`);
  }
  if (kind) query = query.eq("kind", kind);
  if (tag) query = query.contains("tags", [tag]);
  if (project) query = query.eq("project_id", project);

  const [{ data: entries, error }, { data: projects }, { data: allTags }] = await Promise.all([
    query,
    supabase.from("projects").select("id, title").order("title"),
    supabase.from("entries").select("tags"),
  ]);

  const tagCounts = new Map<string, number>();
  allTags?.forEach((r) => r.tags.forEach((t: string) => tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)));
  const tags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 24);

  const filtered = Boolean(q || kind || tag || project);

  return (
    <main className="with-sidebar">
      <aside className="sidebar">
        <form className="stack">
          <input name="q" defaultValue={q} placeholder="Search entries…" />
          <select name="kind" defaultValue={kind ?? ""}>
            <option value="">All types</option>
            {ENTRY_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <select name="project" defaultValue={project ?? ""}>
            <option value="">All projects</option>
            {projects?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          {tag && <input type="hidden" name="tag" value={tag} />}
          <button className="btn small">Filter</button>
          {filtered && (
            <Link href="/" className="muted small-text">
              Clear filters
            </Link>
          )}
        </form>

        {tags.length > 0 && (
          <div className="tag-cloud">
            <h4>Tags</h4>
            {tags.map(([t, n]) => (
              <Link key={t} href={`/?tag=${encodeURIComponent(t)}`} className={`tag ${t === tag ? "active" : ""}`}>
                #{t} <span className="muted">{n}</span>
              </Link>
            ))}
          </div>
        )}
      </aside>

      <section>
        {error && <p className="error">{error.message}</p>}
        {!entries?.length ? (
          <div className="empty">
            <p>{filtered ? "No entries match." : "Nothing here yet."}</p>
            {!filtered && (
              <Link href="/entries/new" className="btn primary">
                Write your first entry
              </Link>
            )}
          </div>
        ) : (
          <div className="grid">
            {(entries as Entry[]).map((e) => (
              <EntryCard key={e.id} entry={e} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
