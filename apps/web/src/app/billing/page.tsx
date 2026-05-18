import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BillingPlans } from "@/components/billing-plans";

export default async function BillingPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/sign-in");
  }

  return (
    <main className="flex-1">
      <section className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10">
        <BillingPlans />
      </section>
    </main>
  );
}
