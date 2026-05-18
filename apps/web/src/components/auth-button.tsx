"use client";

import { signIn, signOut } from "next-auth/react";
import { GoogleMark } from "@/components/google-mark";

type AuthButtonProps = {
  signedIn: boolean;
};

export function AuthButton({ signedIn }: AuthButtonProps) {
  if (signedIn) {
    return (
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-semibold text-white transition hover:border-[#f7c743] hover:text-[#f7c743]"
      >
        Sign out
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/workspace" })}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#111111] transition hover:translate-y-[-1px]"
    >
      <GoogleMark />
      Continue with Google
    </button>
  );
}
