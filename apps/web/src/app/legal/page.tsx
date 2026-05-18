const legalSections = [
  {
    title: "Privacy & data handling",
    body:
      "Customer uploads, forensic outputs and audit telemetry must only be processed for agreed detection, security and compliance purposes. Production roll-out should be backed by region-specific data retention rules and signed data processing terms.",
  },
  {
    title: "Acceptable use",
    body:
      "The platform is intended for authenticity verification, fraud prevention, marketplace trust and enterprise moderation. It must not be used to bypass legal review, violate privacy rights or automate harmful surveillance.",
  },
  {
    title: "AI governance",
    body:
      "Detection scores are probabilistic signals. Human review, documented escalation and chain-of-custody controls should remain in place for regulated or customer-impacting decisions.",
  },
  {
    title: "Commercial operations",
    body:
      "Enterprise availability, support windows, payment rails and marketplace terms should be finalized in contractual documents, not inferred only from marketing pages or deployment defaults.",
  },
];

export default function LegalPage() {
  return (
    <main className="flex-1">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 md:px-10">
        <div className="rounded-[2rem] border border-[var(--border-strong)] bg-[var(--surface)] p-8 shadow-[0_24px_70px_rgba(17,17,17,0.06)] md:p-10">
          <div className="inline-flex rounded-full border border-[var(--border-accent)] bg-[var(--accent-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            Enterprise Legal Surface
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-[var(--foreground)] md:text-5xl">
            Legal, privacy and compliance posture
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--muted-foreground)]">
            This page is a production-ready legal shell for the Smith-Heffa platform. It is intentionally concise and designed
            to be replaced or expanded with approved Buttertech legal language before commercial launch.
          </p>
        </div>

        <div className="grid gap-5">
          {legalSections.map((section) => (
            <article
              key={section.title}
              className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-7 shadow-[0_16px_40px_rgba(17,17,17,0.04)]"
            >
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                {section.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                {section.body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
