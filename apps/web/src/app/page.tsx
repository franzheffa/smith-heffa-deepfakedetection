import Link from "next/link";
import { auth } from "@/auth";
import { AuthButton } from "@/components/auth-button";

const pillars = [
  "Protected Next.js workspace with Google sign-in.",
  "Live multi-provider AI routing across Claude, ChatGPT and Gemini.",
  "Detection execution path wired to the current production API.",
  "Checkout hand-off into the Buttertech payment gateway.",
];

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex-1">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-10 md:px-10 lg:px-12">
        <div className="rounded-[2rem] border border-[var(--border-strong)] bg-[var(--surface)] p-8 shadow-[0_28px_80px_rgba(17,17,17,0.08)] md:p-12">
          <div className="mb-8 inline-flex rounded-full border border-[var(--border-accent)] bg-[var(--accent-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
            Buttertech AI Ecosystem
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.45fr_0.85fr] lg:items-start">
            <div>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-[var(--foreground)] md:text-7xl">
                Smith-Heffa detection is now a live Next.js control plane.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted-foreground)]">
                Launch a real operator experience with Google authentication, live AI routing, payment entry points,
                and the production deepfake image detection pipeline behind one enterprise shell.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--foreground)] px-6 text-sm font-semibold text-[var(--surface)] transition hover:translate-y-[-1px] hover:bg-[var(--foreground-soft)]"
                  href={session ? "/workspace" : "/sign-in"}
                >
                  {session ? "Open workspace" : "Open secure sign-in"}
                </Link>
                <Link
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-6 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                  href="/legal"
                >
                  Review legal surface
                </Link>
              </div>
            </div>

            <aside className="rounded-[1.75rem] border border-[var(--border-soft)] bg-[var(--foreground)] p-6 text-[var(--surface)] shadow-[0_20px_50px_rgba(17,17,17,0.16)]">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm uppercase tracking-[0.18em] text-[var(--accent)]">
                  Access
                </div>
                <AuthButton signedIn={Boolean(session)} />
              </div>
              <ul className="mt-5 space-y-4 text-sm leading-7 text-white/80">
                {pillars.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[var(--accent)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
