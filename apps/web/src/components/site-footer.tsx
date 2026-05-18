const footerColumns = [
  {
    title: "Platform",
    links: [
      { label: "Live detection", href: "/#detection-console" },
      { label: "Secure workspace", href: "/workspace" },
      { label: "Legal & compliance", href: "/legal" },
    ],
  },
  {
    title: "Ecosystem",
    links: [
      { label: "Vercel", href: "https://vercel.com" },
      { label: "Google Cloud", href: "https://cloud.google.com" },
      { label: "NVIDIA AI Enterprise", href: "https://www.nvidia.com/en-us/data-center/products/ai-enterprise/" },
    ],
  },
  {
    title: "Operations",
    links: [
      { label: "Google sign-in", href: "/sign-in" },
      { label: "Payment routing", href: "/workspace" },
      { label: "Audit API", href: "/api/audit" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-black/5 bg-[#101010] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 md:px-10 lg:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
          <div className="max-w-xl">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f7c743]">
              Buttertech
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
              Enterprise trust infrastructure for AI-native media verification.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/72">
              Smith-Heffa Deepfake Detection is now positioned as the public trust layer for
              image verification, operator review, usage-based monetization, and Buttertech
              enterprise rollout.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f7c743]">
                  {column.title}
                </h3>
                <div className="mt-4 space-y-3">
                  {column.links.map((link) => {
                    const external = link.href.startsWith("http");

                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                        className="block text-sm text-white/72 transition hover:text-[#f7c743]"
                      >
                        {link.label}
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#f7c743]/15 pt-5 text-sm text-white/56 md:flex-row md:justify-between">
          <span>© 2026 Buttertech. Smith-Heffa platform.</span>
          <span>Brand system: pure white, black, sun gold.</span>
        </div>
      </div>
    </footer>
  );
}
