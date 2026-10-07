import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function sendLink(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const allowed = process.env.ALLOWED_EMAIL?.trim().toLowerCase();

  if (!email) redirect("/login?error=missing");
  if (allowed && email !== allowed) redirect("/login?error=denied");

  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  redirect(error ? "/login?error=send" : "/login?sent=1");
}

const MESSAGES: Record<string, string> = {
  missing: "Enter an email address.",
  denied: "This journal is private.",
  send: "Couldn't send the link — try again in a minute.",
  link: "That link expired or was already used. Request a new one.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  return (
    <main className="login">
      <h1 className="wordmark">Thesis Journal</h1>
      {sent ? (
        <p className="muted">Check your inbox for a sign-in link.</p>
      ) : (
        <form action={sendLink} className="stack">
          <label className="field">
            <span>Email</span>
            <input type="email" name="email" required autoFocus placeholder="you@newschool.edu" />
          </label>
          <button className="btn primary">Send magic link</button>
          {error && <p className="error">{MESSAGES[error] ?? "Something went wrong."}</p>}
        </form>
      )}
    </main>
  );
}
