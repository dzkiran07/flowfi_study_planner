"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  user: { id: string; fullName: string; email: string } | null;
  token: string | null;
  isLoading: boolean;
  login: (data: {
    user: { id: string; fullName: string; email: string };
    token: string;
  }) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; fullName: string; email: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("flowfi_user");
    const storedToken = localStorage.getItem("flowfi_token");

    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const parsedToken = storedToken;
    // Avoid synchronous setState during render/effect body (eslint rule)
    setTimeout(() => {
      if (parsedUser) setUser(parsedUser);
      if (parsedToken) setToken(parsedToken);
    }, 0);


    // If we have a stored token, validate it by calling backend /auth/me.
    // If validation fails, clear local auth.
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
    user: { id: string; fullName: string; email: string };
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

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
