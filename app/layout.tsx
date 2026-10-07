import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thesis Journal",
  description: "A private place to organize thesis ideas and projects.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        {user && (
          <header className="topbar">
            <Link href="/" className="wordmark">
              Thesis Journal
            </Link>
            <nav>
              <Link href="/">Entries</Link>
              <Link href="/projects">Projects</Link>
              <Link href="/entries/new" className="btn primary small">
                + New entry
              </Link>
              <form action={signOut}>
                <button className="link-btn">Sign out</button>
              </form>
            </nav>
          </header>
        )}
        <div className="page">{children}</div>
      </body>
    </html>
  );
}
