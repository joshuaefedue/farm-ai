"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface QueryOptions<T> {
  enabled?: boolean;
  transform?: (rows: T[]) => T[];
}

/**
 * Generic hook for a Supabase SELECT query.
 * `buildQuery` receives the typed client and returns any Supabase query builder.
 */
export function useSupabaseQuery<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buildQuery: (supabase: ReturnType<typeof createClient>) => { then: any },
  deps: unknown[],
  options: QueryOptions<T> = {}
) {
  const { enabled = true, transform } = options;
  const [data, setData]         = useState<T[]>([]);
  const [isLoading, setLoading] = useState(enabled);
  const [error, setError]       = useState<string | null>(null);
  const supabase = useRef(createClient()).current;

  const load = useCallback(async () => {
    if (!enabled) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await buildQuery(supabase);
      const { data: rows, error: err } = response;
      if (err) throw err;
      const mapped = transform ? transform(rows ?? []) : (rows ?? []);
      setData(mapped);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [enabled, ...deps]);

  useEffect(() => { load(); }, [load]);

  return { data, isLoading, error, refresh: load };
}
