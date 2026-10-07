import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createProject } from "@/app/actions";
import { PROJECT_STATUSES, formatDate } from "@/lib/types";

export default async function Projects() {
  const supabase = await createClient();
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*, entries(count)")
    .order("updated_at", { ascending: false });

  return (
    <main>
      <h1 className="page-title">Projects</h1>
      {error && <p className="error">{error.message}</p>}

      <div className="grid">
        {projects?.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}`} className="card">
            <div className="meta">
              <span className={`status status-${p.status}`}>{p.status}</span>
              <span className="muted">{p.entries?.[0]?.count ?? 0} entries</span>
            </div>
            <h3>{p.title}</h3>
            {p.summary && <p className="preview">{p.summary}</p>}
            <p className="muted small-text">Updated {formatDate(p.updated_at)}</p>
          </Link>
        ))}

        <form action={createProject} className="card new-card stack">
          <h3>New project</h3>
          <input name="title" placeholder="Working title" required />
          <textarea name="summary" rows={3} placeholder="One-line premise" />
          <select name="status" defaultValue="idea">
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button className="btn primary small">Add project</button>
        </form>
      </div>
    </main>
  );
}
