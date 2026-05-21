import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

  return <AppShell />;
}
