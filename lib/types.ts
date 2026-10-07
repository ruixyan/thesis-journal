export const ENTRY_KINDS = ["idea", "note", "reference", "reflection", "todo"] as const;
export type EntryKind = (typeof ENTRY_KINDS)[number];

export const PROJECT_STATUSES = ["idea", "exploring", "prototyping", "done", "parked"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export type Project = {
  id: string;
  title: string;
  summary: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
};

export type Entry = {
  id: string;
  project_id: string | null;
  title: string;
  body: string | null;
  kind: EntryKind;
  tags: string[];
  link: string | null;
  pinned: boolean;
  created_at: string;
  updated_at: string;
  projects?: { id: string; title: string } | null;
};

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
