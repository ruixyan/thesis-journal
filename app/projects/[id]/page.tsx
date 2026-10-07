import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EntryCard from "@/components/EntryCard";
import { deleteProject, updateProject } from "@/app/actions";
import { PROJECT_STATUSES, type Entry, type Project } from "@/lib/types";

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const { edit } = await searchParams;
  const supabase = await createClient();

  const [{ data: project }, { data: entries }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).single<Project>(),
    supabase
      .from("entries")
      .select("*")
      .eq("project_id", id)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);
  if (!project) notFound();

  return (
    <main>
      {edit ? (
        <form action={updateProject.bind(null, id)} className="stack narrow-block">
          <input name="title" className="title-input" defaultValue={project.title} required />
          <textarea name="summary" rows={4} defaultValue={project.summary ?? ""} placeholder="Premise, questions, constraints…" />
          <select name="status" defaultValue={project.status}>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="row actions">
            <button className="btn primary">Save</button>
            <Link href={`/projects/${id}`} className="btn">
              Cancel
            </Link>
          </div>
        </form>
      ) : (
        <header className="project-head">
          <span className={`status status-${project.status}`}>{project.status}</span>
          <h1>{project.title}</h1>
          {project.summary && <p className="lede">{project.summary}</p>}
          <div className="row actions">
            <Link href={`/entries/new?project=${id}`} className="btn primary small">
              + Entry in this project
            </Link>
            <Link href={`/projects/${id}?edit=1`} className="btn small">
              Edit
            </Link>
            <form action={deleteProject.bind(null, id)}>
              <button className="btn danger small">Delete</button>
            </form>
          </div>
        </header>
      )}

      {!entries?.length ? (
        <p className="empty muted">No entries linked yet.</p>
      ) : (
        <div className="grid">
          {(entries as Entry[]).map((e) => (
            <EntryCard key={e.id} entry={e} />
          ))}
        </div>
      )}
    </main>
  );
}
