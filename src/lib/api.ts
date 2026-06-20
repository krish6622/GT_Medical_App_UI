import axios, { AxiosError, AxiosRequestConfig } from "axios";

const BASE = (import.meta.env.VITE_API_BASE || "") + "/api/v1";

const ACCESS = "gtm_access";
const REFRESH = "gtm_refresh";

export const tokens = {
  get access() { return localStorage.getItem(ACCESS); },
  get refresh() { return localStorage.getItem(REFRESH); },
  set(access: string, refresh: string) {
    localStorage.setItem(ACCESS, access);
    localStorage.setItem(REFRESH, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
  },
};

export const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  const t = tokens.access;
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const rt = tokens.refresh;
  if (!rt) return null;
  try {
    const r = await axios.post(`${BASE}/auth/refresh`, { refresh_token: rt });
    tokens.set(r.data.access_token, r.data.refresh_token);
    return r.data.access_token;
  } catch {
    tokens.clear();
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && original && !original._retry && tokens.refresh) {
      original._retry = true;
      refreshing = refreshing || doRefresh();
      const newToken = await refreshing;
      refreshing = null;
      if (newToken) {
        original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` };
        return api(original);
      }
      // refresh failed → bounce to login
      if (location.pathname !== "/login") location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export function apiError(e: unknown): string {
  const err = e as AxiosError<{ detail?: string }>;
  const d = err.response?.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return (d as any[]).map((x) => x.msg).join(", ");
  return err.message || "Something went wrong";
}
