"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ENTRY_KINDS, PROJECT_STATUSES } from "@/lib/types";
import { BUCKET } from "@/lib/images";

type Supabase = Awaited<ReturnType<typeof createClient>>;

// Uploads any files from the form's "images" input; returns their storage paths.
async function uploadImages(supabase: Supabase, fd: FormData) {
  const files = fd
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0 && f.type.startsWith("image/"));
  if (!files.length) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const paths: string[] = [];
  for (const file of files) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    paths.push(path);
  }
  return paths;
}

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
  const images = await uploadImages(supabase, fd);
  const { data, error } = await supabase
    .from("entries")
    .insert({ ...entryFields(fd), images })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  redirect(`/entries/${data.id}`);
}

export async function updateEntry(id: string, fd: FormData) {
  const supabase = await createClient();

  const { data: current } = await supabase.from("entries").select("images").eq("id", id).single();
  const existing: string[] = current?.images ?? [];
  const removed = fd.getAll("remove_image").map(String);
  const added = await uploadImages(supabase, fd);

  const { error } = await supabase
    .from("entries")
    .update({ ...entryFields(fd), images: [...existing.filter((p) => !removed.includes(p)), ...added] })
    .eq("id", id);
  if (error) throw new Error(error.message);
  if (removed.length) await supabase.storage.from(BUCKET).remove(removed);
  revalidatePath("/", "layout");
  redirect(`/entries/${id}`);
}

export async function deleteEntry(id: string) {
  const supabase = await createClient();
  const { data: current } = await supabase.from("entries").select("images").eq("id", id).single();
  const { error } = await supabase.from("entries").delete().eq("id", id);
  if (error) throw new Error(error.message);
  if (current?.images?.length) await supabase.storage.from(BUCKET).remove(current.images);
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
