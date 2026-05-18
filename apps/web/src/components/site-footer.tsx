const footerColumns = [
  {
    title: "Platform",
    links: [
      { label: "Enterprise shell", href: "/" },
      { label: "Legal & compliance", href: "/legal" },
      {
        label: "Current production frontend",
        href:
          process.env.NEXT_PUBLIC_VITE_FRONTEND_URL
          || "https://frontend-buttertech-team.vercel.app",
      },
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
      {
        label: "GitHub repository",
        href:
          process.env.NEXT_PUBLIC_GITHUB_REPO
          || "https://github.com/franzheffa/smith-heffa-deepfakedetection",
      },
      {
        label: "Monitoring dashboard",
        href:
          process.env.NEXT_PUBLIC_DASHBOARD_URL
          || "https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=DeepFake-Monitoring-Dashboard",
      },
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
              Smith-Heffa Deepfake Detection is being hardened for production rollout across
              marketplace, partner and enterprise channels with a stable migration path.
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
