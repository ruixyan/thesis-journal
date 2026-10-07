import Link from "next/link";
import { ENTRY_KINDS, type Entry, type Project } from "@/lib/types";

type Props = {
  action: (fd: FormData) => Promise<void>;
  projects: Pick<Project, "id" | "title">[];
  entry?: Entry;
  defaultProjectId?: string;
  imageUrls?: Record<string, string>;
  cancelHref: string;
};

export default function EntryForm({ action, projects, entry, defaultProjectId, imageUrls = {}, cancelHref }: Props) {
  return (
    <form action={action} className="stack editor">
      <input
        name="title"
        className="title-input"
        placeholder="Title"
        defaultValue={entry?.title}
        autoFocus={!entry}
      />

      <div className="row">
        <label className="field">
          <span>Type</span>
          <select name="kind" defaultValue={entry?.kind ?? "idea"}>
            {ENTRY_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>

        <label className="field grow">
          <span>Project</span>
          <select name="project_id" defaultValue={entry?.project_id ?? defaultProjectId ?? ""}>
            <option value="">— none —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span>Notes</span>
        <textarea
          name="body"
          rows={14}
          defaultValue={entry?.body ?? ""}
          placeholder="Write freely. Blank lines become paragraphs."
        />
      </label>

      <div className="field">
        <span>Images</span>
        {!!entry?.images.length && (
          <div className="thumb-grid">
            {entry.images.map((path) => (
              <label key={path} className="thumb">
                {imageUrls[path] && <img src={imageUrls[path]} alt="" />}
                <span className="check">
                  <input type="checkbox" name="remove_image" value={path} /> Remove
                </span>
              </label>
            ))}
          </div>
        )}
        <input type="file" name="images" accept="image/*" multiple className="file-input" />
      </div>

      <div className="row">
        <label className="field grow">
          <span>Tags (comma separated)</span>
          <input name="tags" defaultValue={entry?.tags.join(", ")} placeholder="typography, archive, motion" />
        </label>
        <label className="field grow">
          <span>Link</span>
          <input name="link" type="url" defaultValue={entry?.link ?? ""} placeholder="https://" />
        </label>
      </div>

      <label className="check">
        <input type="checkbox" name="pinned" defaultChecked={entry?.pinned} /> Pin to top
      </label>

      <div className="row actions">
        <button className="btn primary">{entry ? "Save" : "Create entry"}</button>
        <Link href={cancelHref} className="btn">
          Cancel
        </Link>
      </div>
    </form>
  );
}
