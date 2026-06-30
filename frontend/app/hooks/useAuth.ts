"use client";

export default function useAuth() {

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  return {
    isAuthenticated: !!token
  };
}
