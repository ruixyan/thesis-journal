import type { SupabaseClient } from "@supabase/supabase-js";

export const BUCKET = "entry-images";

// The bucket is private, so images are shown through short-lived signed URLs.
export async function signImages(supabase: SupabaseClient, paths: string[]) {
  const unique = [...new Set(paths.filter(Boolean))];
  const map = new Map<string, string>();
  if (!unique.length) return map;

  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(unique, 60 * 60);
  data?.forEach((d) => {
    if (d.path && d.signedUrl) map.set(d.path, d.signedUrl);
  });
  return map;
}
