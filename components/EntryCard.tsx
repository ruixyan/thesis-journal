import Link from "next/link";
import { formatDate, type Entry } from "@/lib/types";

export default function EntryCard({ entry }: { entry: Entry }) {
  const preview = (entry.body ?? "").slice(0, 220);

  return (
    <Link href={`/entries/${entry.id}`} className="card">
      <div className="meta">
        <span className={`kind kind-${entry.kind}`}>{entry.kind}</span>
        {entry.pinned && <span className="pin">Pinned</span>}
        <span className="muted">{formatDate(entry.created_at)}</span>
      </div>
      <h3>{entry.title}</h3>
      {preview && (
        <p className="preview">
          {preview}
          {(entry.body ?? "").length > 220 ? "…" : ""}
        </p>
      )}
      <div className="meta">
        {entry.projects && <span className="project-chip">{entry.projects.title}</span>}
        {entry.tags.map((t) => (
          <span key={t} className="tag">
            #{t}
          </span>
        ))}
      </div>
    </Link>
  );
}
