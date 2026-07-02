"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({
  children,
  adminOnly = false
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (adminOnly) {
      try {
        const payload = token.split(".")[1];
        if (!payload) {
          router.push("/dashboard");
          return;
        }
        const decoded = JSON.parse(atob(payload));
        const isAdmin = decoded?.is_admin === true || decoded?.role === "admin";
        if (!isAdmin) {
          router.push("/dashboard");
        }
      } catch {
        router.push("/dashboard");
      }
    }
  }, [adminOnly, router]);

  return <>{children}</>;
}
