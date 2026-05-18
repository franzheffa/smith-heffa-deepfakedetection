import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AgentConsole } from "@/components/agent-console";
import { BillingPlans } from "@/components/billing-plans";
import { DetectionConsole } from "@/components/detection-console";

export default async function WorkspacePage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/sign-in");
  }

  return (
    <main className="flex-1">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10 md:px-10 lg:px-12">
        <div className="rounded-[1.75rem] border border-[var(--border-strong)] bg-white p-6 shadow-[0_20px_50px_rgba(17,17,17,0.05)]">
          <div className="inline-flex rounded-full border border-[var(--border-accent)] bg-[var(--accent-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            Live workspace
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-[var(--foreground)]">
            Welcome back, {session.user.name || session.user.email}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted-foreground)]">
            You can now run image detections, converse with the multi-model agent, and route buyers into the Buttertech paygate.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <DetectionConsole />
          <BillingPlans />
        </div>

        <AgentConsole />
      </section>
    </main>
  );
}
