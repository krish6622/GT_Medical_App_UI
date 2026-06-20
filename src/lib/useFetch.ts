import { useCallback, useEffect, useState } from "react";
import { api, apiError } from "./api";

export interface FetchState<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
}

/** Minimal data-fetching hook with a reload() function. */
export function useFetch<T>(url: string | null, deps: unknown[] = []) {
  const [state, setState] = useState<FetchState<T>>({ loading: !!url, error: null, data: null });

  const reload = useCallback(async () => {
    if (!url) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const r = await api.get<T>(url);
      setState({ loading: false, error: null, data: r.data });
    } catch (e) {
      setState({ loading: false, error: apiError(e), data: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...deps]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...state, reload, setData: (d: T) => setState((s) => ({ ...s, data: d })) };
}
