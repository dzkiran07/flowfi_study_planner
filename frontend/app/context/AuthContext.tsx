"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AuthUser = { id: string; fullName: string; email: string; role?: "user" | "admin" };

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (data: {
    user: AuthUser;
    token: string;
  }) => void;
  logout: () => void;
  /** Patches the cached user in-place (state + localStorage) so the rest of the app reflects a profile edit immediately, without a re-login. */
  updateUser: (patch: Partial<AuthUser>) => void;
  /** Swaps in a freshly-issued token (state + localStorage) without touching the cached user — used after a change-password call rotates the token. */
  updateToken: (token: string) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
  updateToken: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("flowfi_token");

    // `user`/`token` only ever get set from a *validated* /auth/me response —
    // never optimistically from cached localStorage — so there's no window
    // where a stale or expired session looks authenticated to the rest of
    // the app while `isLoading` is still true.
    const validate = async () => {
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const meRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (!meRes.ok) {
          throw new Error("Token invalid");
        }

        const meData = await meRes.json();
        if (meData?.success && meData?.user) {
          setUser(meData.user);
          setToken(storedToken);
          localStorage.setItem("flowfi_user", JSON.stringify(meData.user));
        } else {
          throw new Error("Unexpected /auth/me response");
        }
      } catch {
        localStorage.removeItem("flowfi_user");
        localStorage.removeItem("flowfi_token");
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    validate();
  }, []);

  const login = (data: {
    user: AuthUser;
    token: string;
  }) => {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("flowfi_user", JSON.stringify(data.user));
    localStorage.setItem("flowfi_token", data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("flowfi_user");
    localStorage.removeItem("flowfi_token");
  };

  const updateUser = (patch: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem("flowfi_user", JSON.stringify(next));
      return next;
    });
  };

  const updateToken = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("flowfi_token", newToken);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser, updateToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
