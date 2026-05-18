const platformLinks = [
  {
    label: "GitHub Repository",
    href: process.env.NEXT_PUBLIC_GITHUB_REPO
      || "https://github.com/franzheffa/smith-heffa-deepfakedetection",
  },
  {
    label: "AWS Monitoring Dashboard",
    href: process.env.NEXT_PUBLIC_DASHBOARD_URL
      || "https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=DeepFake-Monitoring-Dashboard",
  },
  {
    label: "Production Frontend",
    href: process.env.NEXT_PUBLIC_VITE_FRONTEND_URL
      || "https://frontend-buttertech-team.vercel.app",
  },
];

const pillars = [
  "Progressive migration from Vite to Next.js App Router without breaking current production.",
  "Enterprise-ready design system with Buttertech branding in pure white, black and sun gold.",
  "Prisma-backed audit trail layer for regulated workflows and forensic event capture.",
  "GitHub Actions and Vercel delivery path prepared for preview and production promotion.",
];

const ecosystem = [
  "Vercel deployment workflows",
  "GitHub delivery automation",
  "Google Cloud Marketplace readiness",
  "NVIDIA AI Enterprise alignment",
];

export default function Home() {
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
                Smith-Heffa Deepfake Detection for enterprise trust operations.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted-foreground)]">
                This Next.js App Router surface is the progressive enterprise shell for the existing detection platform.
                It is designed to sit alongside the live Vite frontend until the migration is fully validated.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--foreground)] px-6 text-sm font-semibold text-[var(--surface)] transition hover:translate-y-[-1px] hover:bg-[var(--foreground-soft)]"
                  href="/legal"
                >
                  Review Legal & Compliance
                </a>
                <a
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-6 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                  href={platformLinks[0].href}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Source Repository
                </a>
              </div>
            </div>

            <aside className="rounded-[1.75rem] border border-[var(--border-soft)] bg-[var(--foreground)] p-6 text-[var(--surface)] shadow-[0_20px_50px_rgba(17,17,17,0.16)]">
              <div className="text-sm uppercase tracking-[0.18em] text-[var(--accent)]">
                Launch Readiness
              </div>
              <ul className="mt-5 space-y-4 text-sm leading-7 text-white/80">
                {ecosystem.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[var(--accent)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white p-8 shadow-[0_20px_50px_rgba(17,17,17,0.05)]">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
              Migration pillars
            </h2>
            <div className="mt-6 grid gap-4">
              {pillars.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-5 text-sm leading-7 text-[var(--muted-foreground)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[0_20px_50px_rgba(17,17,17,0.05)]">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
              Enterprise access points
            </h2>
            <div className="mt-6 space-y-4">
              {platformLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-[var(--border-soft)] bg-white px-5 py-4 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)] hover:shadow-[0_16px_30px_rgba(17,17,17,0.06)]"
                >
                  <span>{link.label}</span>
                  <span className="text-[var(--accent-strong)]">Open</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
