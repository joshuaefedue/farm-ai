export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          reg_number: string | null;
          state: string | null;
          lga: string | null;
          address: string | null;
          owner_name: string | null;
          owner_phone: string | null;
          wa_number: string | null;
          established_year: number | null;
          size_ha: number | null;
          bird_capacity: number | null;
          plan: string;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["organizations"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
      };
      organization_members: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          role: "owner" | "manager" | "vet" | "sales" | "logistics" | "readonly";
          active: boolean;
          invited_by: string | null;
          joined_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["organization_members"]["Row"], "id" | "joined_at">;
        Update: Partial<Database["public"]["Tables"]["organization_members"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      houses: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          type: string | null;
          capacity: number | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["houses"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["houses"]["Insert"]>;
      };
      batches: {
        Row: {
          id: string;
          org_id: string;
          name: string | null;
          breed: string | null;
          type: "layer" | "broiler" | "dual";
          arrival_date: string | null;
          house_id: string | null;
          house_name: string | null;
          start_count: number | null;
          current_count: number | null;
          mortality_pct: number | null;
          fcr: number | null;
          egg_rate: number | null;
          avg_weight: number | null;
          status: "laying" | "growing" | "sold";
          supplier: string | null;
          cost_per_bird: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["batches"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["batches"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          org_id: string;
          order_date: string;
          customer: string;
          channel: string | null;
          items: string | null;
          subtotal: number;
          status: "pending" | "confirmed" | "out_for_delivery" | "delivered" | "cancelled";
          payment: "unpaid" | "invoiced" | "paid";
          payment_method: string | null;
          phone: string | null;
          is_coop: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      vaccinations: {
        Row: {
          id: string;
          org_id: string;
          batch_id: string | null;
          vaccine: string;
          route: string | null;
          scheduled_date: string;
          administered_date: string | null;
          status: "pending" | "done";
          birds_count: number | null;
          lot_number: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["vaccinations"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["vaccinations"]["Insert"]>;
      };
      batch_logs: {
        Row: {
          id: string;
          org_id: string;
          batch_id: string;
          log_date: string;
          log_type: "mortality" | "feed" | "eggs" | "weight";
          value: number;
          notes: string | null;
          logged_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["batch_logs"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["batch_logs"]["Insert"]>;
      };
      alerts: {
        Row: {
          id: string;
          org_id: string;
          level: "danger" | "warning" | "info" | "success";
          title: string;
          meta: string | null;
          icon: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["alerts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["alerts"]["Insert"]>;
      };
    };
    Functions: {
      user_org_ids: {
        Args: Record<string, never>;
        Returns: string[];
      };
    };
  };
}

// ── Convenient shorthand types ────────────────────────────────────────────────
export type Organization   = Database["public"]["Tables"]["organizations"]["Row"];
export type OrgMember      = Database["public"]["Tables"]["organization_members"]["Row"];
export type Profile        = Database["public"]["Tables"]["profiles"]["Row"];
export type House          = Database["public"]["Tables"]["houses"]["Row"];
export type Batch          = Database["public"]["Tables"]["batches"]["Row"];
export type Order          = Database["public"]["Tables"]["orders"]["Row"];
export type Vaccination    = Database["public"]["Tables"]["vaccinations"]["Row"];
export type BatchLog       = Database["public"]["Tables"]["batch_logs"]["Row"];
export type AlertRow       = Database["public"]["Tables"]["alerts"]["Row"];
export type UserRole       = OrgMember["role"];
