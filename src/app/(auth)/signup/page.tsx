"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * /signup now redirects to /onboarding.
 * The onboarding wizard collects farm details first, then creates
 * the account at the final step — no auth required upfront.
 */
export default function SignupPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/onboarding"); }, [router]);
  return null;
}
