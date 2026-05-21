import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "./_components/AdminShell";

export const metadata = {
  title: "Acre Farm OS — Admin Console",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // ── 1. Auth check ───────────────────────────────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/dashboard");
  }

  // ── 2. Admin check ──────────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    // Logged in but not an admin — redirect to dashboard
    redirect("/");
  }

  return (
    <AdminShell
      adminName={profile.full_name ?? user.email ?? "Admin"}
      adminEmail={user.email ?? ""}
    >
      {children}
    </AdminShell>
  );
}
