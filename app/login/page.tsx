import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function signIn(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const allowed = process.env.ALLOWED_EMAIL?.trim().toLowerCase();

  if (allowed && email !== allowed) redirect("/login?error=denied");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  redirect(error ? "/login?error=wrong" : "/");
}

const MESSAGES: Record<string, string> = {
  denied: "This journal is private.",
  wrong: "Wrong email or password.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="login">
      <h1 className="wordmark">Thesis Journal</h1>
      <form action={signIn} className="stack">
        <label className="field">
          <span>Email</span>
          <input type="email" name="email" required autoFocus />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" name="password" required />
        </label>
        <button className="btn primary">Sign in</button>
        {error && <p className="error">{MESSAGES[error] ?? "Something went wrong."}</p>}
      </form>
    </main>
  );
}
