"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { Organization, OrgMember, Profile, UserRole } from "@/lib/supabase/types";
import type { User } from "@supabase/supabase-js";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface OrgWithRole extends Organization {
  role: UserRole;
}

interface OrgContextValue {
  // Auth
  user: User | null;
  profile: Profile | null;
  isLoadingAuth: boolean;
  signOut: () => Promise<void>;

  // Org
  org: OrgWithRole | null;
  orgs: OrgWithRole[];
  isLoadingOrg: boolean;
  switchOrg: (orgId: string) => void;
  refreshOrg: () => Promise<void>;

  // Convenience
  role: UserRole | null;
  canWrite: boolean;
  isOwner: boolean;
}

const OrgContext = createContext<OrgContextValue | null>(null);

const ORG_STORAGE_KEY = "acre_current_org";

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co";

// ── Provider ──────────────────────────────────────────────────────────────────
export function OrgProvider({ children }: { children: React.ReactNode }) {
  // When Supabase isn't configured (local dev without env), render children directly
  if (!SUPABASE_CONFIGURED) {
    return <OrgContext.Provider value={{
      user: null, profile: null, isLoadingAuth: false,
      signOut: async () => {},
      org: null, orgs: [], isLoadingOrg: false,
      switchOrg: () => {}, refreshOrg: async () => {},
      role: null, canWrite: true, isOwner: true,
    }}>{children}</OrgContext.Provider>;
  }

  return <OrgProviderInner>{children}</OrgProviderInner>;
}

function OrgProviderInner({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const [user, setUser]               = useState<User | null>(null);
  const [profile, setProfile]         = useState<Profile | null>(null);
  const [isLoadingAuth, setLoadingAuth] = useState(true);
  const [orgs, setOrgs]               = useState<OrgWithRole[]>([]);
  const [org, setOrg]                 = useState<OrgWithRole | null>(null);
  const [isLoadingOrg, setLoadingOrg] = useState(true);

  // ── Load user + profile ───────────────────────────────────────────────────
  useEffect(() => {
    const loadUser = async () => {
      // getSession() reads from localStorage synchronously — never makes a
      // network call and is always reliable right after sign-in.
      // getUser() does a server round-trip to re-validate the JWT which can
      // transiently return null immediately after a redirect.
      const { data: { session } } = await supabase.auth.getSession();
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const { data: p } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", u.id)
          .single();
        setProfile(p);
      }
      setLoadingAuth(false);
    };
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setProfile(null);
        setOrgs([]);
        setOrg(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load orgs when user changes ───────────────────────────────────────────
  const loadOrgs = useCallback(async () => {
    if (!user) { setOrgs([]); setOrg(null); setLoadingOrg(false); return; }
    setLoadingOrg(true);

    const { data: membersRaw } = await supabase
      .from("organization_members")
      .select("org_id, role")
      .eq("user_id", user.id)
      .eq("active", true);

    const members = (membersRaw ?? []) as Array<{ org_id: string; role: string }>;

    if (members.length === 0) {
      setOrgs([]); setOrg(null); setLoadingOrg(false); return;
    }

    const orgIds = members.map((m) => m.org_id);
    const { data: organizationsRaw } = await supabase
      .from("organizations")
      .select("*")
      .in("id", orgIds);

    const organizations = (organizationsRaw ?? []) as Organization[];
    if (!organizations.length) { setLoadingOrg(false); return; }

    const withRoles: OrgWithRole[] = organizations.map((o: Organization) => ({
      ...o,
      role: (members.find((m) => m.org_id === o.id)?.role ?? "readonly") as UserRole,
    }));

    setOrgs(withRoles);

    // Restore last selected org or default to first
    const saved = typeof window !== "undefined"
      ? localStorage.getItem(ORG_STORAGE_KEY)
      : null;
    const found = saved ? withRoles.find((o) => o.id === saved) : null;
    setOrg(found ?? withRoles[0] ?? null);
    setLoadingOrg(false);
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadOrgs(); }, [loadOrgs]);

  // ── Switch org ────────────────────────────────────────────────────────────
  const switchOrg = useCallback((orgId: string) => {
    const found = orgs.find((o) => o.id === orgId);
    if (found) {
      setOrg(found);
      if (typeof window !== "undefined") {
        localStorage.setItem(ORG_STORAGE_KEY, orgId);
      }
    }
  }, [orgs]);

  // ── Sign out ──────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      localStorage.removeItem(ORG_STORAGE_KEY);
      window.location.href = "/login";
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const role = org?.role ?? null;
  const canWrite = role !== null && role !== "readonly";
  const isOwner  = role === "owner";

  return (
    <OrgContext.Provider value={{
      user, profile, isLoadingAuth, signOut,
      org, orgs, isLoadingOrg, switchOrg, refreshOrg: loadOrgs,
      role, canWrite, isOwner,
    }}>
      {children}
    </OrgContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used inside <OrgProvider>");
  return ctx;
}
