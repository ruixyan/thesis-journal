"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ENTRY_KINDS, PROJECT_STATUSES } from "@/lib/types";

function str(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

function entryFields(fd: FormData) {
  const kind = str(fd, "kind");
  return {
    title: str(fd, "title") || "Untitled",
    body: str(fd, "body"),
    kind: (ENTRY_KINDS as readonly string[]).includes(kind) ? kind : "note",
    project_id: str(fd, "project_id") || null,
    link: str(fd, "link") || null,
    pinned: fd.get("pinned") === "on",
    tags: str(fd, "tags")
      .split(",")
      .map((t) => t.trim().toLowerCase().replace(/^#/, ""))
      .filter(Boolean),
  };
}

function projectFields(fd: FormData) {
  const status = str(fd, "status");
  return {
    title: str(fd, "title") || "Untitled project",
    summary: str(fd, "summary"),
    status: (PROJECT_STATUSES as readonly string[]).includes(status) ? status : "idea",
  };
}

// ---------- Entries ----------

export async function createEntry(fd: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("entries").insert(entryFields(fd)).select("id").single();
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  redirect(`/entries/${data.id}`);
}

export async function updateEntry(id: string, fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("entries").update(entryFields(fd)).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  redirect(`/entries/${id}`);
}

export async function deleteEntry(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("entries").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  redirect("/");
}

// ---------- Projects ----------

export async function createProject(fd: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").insert(projectFields(fd)).select("id").single();
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  redirect(`/projects/${data.id}`);
}

export async function updateProject(id: string, fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").update(projectFields(fd)).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  redirect(`/projects/${id}`);
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  // Entries stay; their project_id is set to null by the FK.
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  redirect("/projects");
}

// ---------- Auth ----------

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
