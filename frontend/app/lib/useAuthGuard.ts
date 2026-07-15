"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

type AuthGuardOptions = {
  /** If set, the signed-in user's `role` must match this, or they're redirected to `/dashboard`. */
  requireRole?: "admin";
};

/**
 * Single source of truth for "is this route allowed to render right now".
 * Every protected layout should use this instead of hand-rolling its own
 * isLoading/redirect logic, so a fix here (or a future third protected
 * area) can't drift out of sync with the others.
 */
export function useAuthGuard(options: AuthGuardOptions = {}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { requireRole } = options;

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (requireRole && user.role !== requireRole) {
      router.push(`/dashboard?denied=${requireRole}`);
    }
  }, [user, isLoading, requireRole, router]);

  const isAuthorized = !isLoading && !!user && (!requireRole || user.role === requireRole);

  return { user, isLoading, isAuthorized };
}
