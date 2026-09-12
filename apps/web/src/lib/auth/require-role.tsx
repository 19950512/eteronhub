"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Role, useAuth } from "./auth-context";

interface RequireRoleProps {
  role: Role;
  redirectTo: string;
  children: ReactNode;
}

export function RequireRole({ role, redirectTo, children }: RequireRoleProps): JSX.Element | null {
  const { payload, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && payload?.role !== role) {
      router.replace(redirectTo);
    }
  }, [isLoading, payload, role, redirectTo, router]);

  if (isLoading || payload?.role !== role) {
    return null;
  }

  return <>{children}</>;
}
