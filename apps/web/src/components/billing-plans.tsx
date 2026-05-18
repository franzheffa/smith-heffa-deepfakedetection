"use client";

const plans = [
  {
    code: "starter",
    name: "Starter",
    price: "$29",
    description: "50 image detections for teams validating early traffic and creators.",
  },
  {
    code: "growth",
    name: "Growth",
    price: "$149",
    description: "500 image detections, audit exports and operator support for launch teams.",
  },
  {
    code: "enterprise",
    name: "Enterprise",
    price: "Custom",
    description: "Custom volume, compliance review, SSO and video roadmap onboarding.",
  },
];

export function BillingPlans() {
  const startCheckout = async (plan: string) => {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    const payload = await response.json();

    if (payload?.url) {
      window.location.href = payload.url;
    }
  };

  return (
    <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white p-6 shadow-[0_20px_50px_rgba(17,17,17,0.05)]">
      <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
        Monetization & checkout
      </h2>
      <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
        Route buyers into the Buttertech payment stack for paid detection access.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.code}
            className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-5"
          >
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
              {plan.name}
            </div>
            <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--foreground)]">
              {plan.price}
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
              {plan.description}
            </p>
            <button
              type="button"
              onClick={() => startCheckout(plan.code)}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--foreground)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--foreground-soft)]"
            >
              Continue to checkout
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
