import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, tokens } from "./api";
import type { Me } from "./types";

interface AuthCtx {
  me: Me | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  can: (perm: string) => boolean;
  isCustomer: boolean;
  isStaff: boolean;
}

const Ctx = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshMe() {
    if (!tokens.access) {
      setMe(null);
      setLoading(false);
      return;
    }
    try {
      const r = await api.get<Me>("/auth/me");
      setMe(r.data);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshMe();
  }, []);

  async function login(email: string, password: string) {
    const r = await api.post("/auth/login", { email, password });
    tokens.set(r.data.access_token, r.data.refresh_token);
    await refreshMe();
  }

  function logout() {
    const rt = tokens.refresh;
    if (rt) api.post("/auth/logout", { refresh_token: rt }).catch(() => {});
    tokens.clear();
    setMe(null);
    location.href = "/login";
  }

  const can = (perm: string) => !!me?.permissions.includes(perm);

  return (
    <Ctx.Provider
      value={{
        me,
        loading,
        login,
        logout,
        can,
        isCustomer: !!me?.customer_id,
        isStaff: !!me && !me.customer_id,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
export const useCan = () => useContext(Ctx).can;
