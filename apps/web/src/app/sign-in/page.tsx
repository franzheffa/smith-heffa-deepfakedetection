import Link from "next/link";
import { signIn } from "@/auth";

export default function SignInPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl rounded-[2rem] border border-[var(--border-strong)] bg-white p-8 shadow-[0_28px_80px_rgba(17,17,17,0.08)]">
        <div className="inline-flex rounded-full border border-[var(--border-accent)] bg-[var(--accent-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
          Secure access
        </div>
        <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-[var(--foreground)]">
          Sign in with Google
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
          Access the protected Smith-Heffa workspace to run detections, route AI requests and launch paid access.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/workspace" });
          }}
          className="mt-8"
        >
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--foreground)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--foreground-soft)]"
          >
            Continue with Google
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 inline-flex text-sm font-medium text-[var(--accent-strong)] transition hover:text-[var(--foreground)]"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
