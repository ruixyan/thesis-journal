import { createClient } from "@/lib/supabase/server";
import EntryForm from "@/components/EntryForm";
import { createEntry } from "@/app/actions";

export default async function NewEntry({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const { project } = await searchParams;
  const supabase = await createClient();
  const { data: projects } = await supabase.from("projects").select("id, title").order("title");

  return (
    <main className="narrow">
      <EntryForm
        action={createEntry}
        projects={projects ?? []}
        defaultProjectId={project}
        cancelHref={project ? `/projects/${project}` : "/"}
      />
    </main>
  );
}
