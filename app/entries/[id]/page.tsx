import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EntryForm from "@/components/EntryForm";
import { deleteEntry, updateEntry } from "@/app/actions";
import { formatDate, type Entry } from "@/lib/types";

export default async function EntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const { edit } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase.from("entries").select("*, projects(id, title)").eq("id", id).single();
  if (!data) notFound();
  const entry = data as Entry;

  if (edit) {
    const { data: projects } = await supabase.from("projects").select("id, title").order("title");
    return (
      <main className="narrow">
        <EntryForm
          action={updateEntry.bind(null, id)}
          projects={projects ?? []}
          entry={entry}
          cancelHref={`/entries/${id}`}
        />
      </main>
    );
  }

  const paragraphs = (entry.body ?? "").split(/\n{2,}/).filter(Boolean);

  return (
    <main className="narrow">
      <article className="entry">
        <div className="meta">
          <span className={`kind kind-${entry.kind}`}>{entry.kind}</span>
          <span className="muted">{formatDate(entry.created_at)}</span>
          {entry.updated_at !== entry.created_at && (
            <span className="muted">· edited {formatDate(entry.updated_at)}</span>
          )}
        </div>
        <h1>{entry.title}</h1>

        {entry.projects && (
          <p>
            Part of{" "}
            <Link href={`/projects/${entry.projects.id}`} className="project-chip">
              {entry.projects.title}
            </Link>
          </p>
        )}

        <div className="prose">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {entry.link && (
          <p>
            <a href={entry.link} target="_blank" rel="noreferrer" className="ext-link">
              ↗ {entry.link}
            </a>
          </p>
        )}

        {entry.tags.length > 0 && (
          <div className="meta">
            {entry.tags.map((t) => (
              <Link key={t} href={`/?tag=${encodeURIComponent(t)}`} className="tag">
                #{t}
              </Link>
            ))}
          </div>
        )}

        <div className="row actions">
          <Link href={`/entries/${id}?edit=1`} className="btn">
            Edit
          </Link>
          <form action={deleteEntry.bind(null, id)}>
            <button className="btn danger">Delete</button>
          </form>
        </div>
      </article>
    </main>
  );
}
