"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  user: { id: string; fullName: string; email: string } | null;
  token: string | null;
  isLoading: boolean;
  login: (user: { id: string; fullName: string; email: string }) => void;
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
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedToken) setToken(storedToken);
    setIsLoading(false);
  }, []);

  const login = (userData: { id: string; fullName: string; email: string }) => {
    setUser(userData);
    setToken("mock-token");
    localStorage.setItem("flowfi_user", JSON.stringify(userData));
    localStorage.setItem("flowfi_token", "mock-token");
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
