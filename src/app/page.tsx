import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { completeOnboarding } from "@/app/actions/onboarding";
import AppShell from "@/components/layout/AppShell";

export default async function Home() {
  // If Supabase isn't configured, skip auth and show the dashboard
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <AppShell />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Unauthenticated → show the landing page
  if (!user) {
    redirect("/landing");
  }

  // Check if user belongs to at least one org
  const { data: membership } = await supabase
    .from("organization_members")
    .select("id")
    .eq("user_id", user.id)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    // User has no org — check if they completed the onboarding form before
    // email confirmation (farm data stored in user metadata during signUp).
    const pendingFarm = user.user_metadata?.pending_farm;

    if (pendingFarm) {
      // Auto-complete onboarding with the saved farm data
      const res = await completeOnboarding({
        userId: user.id,
        ownerName: user.user_metadata?.full_name ?? undefined,
        ...pendingFarm,
      });

      if (res.success) {
        // Farm created — reload so the dashboard picks up the new org
        redirect("/");
      }
    }

    // No pending data → send to onboarding wizard
    redirect("/onboarding");
  }

  return <AppShell />;
}
