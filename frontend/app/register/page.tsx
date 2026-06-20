"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "../lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleRegister(e?: React.FormEvent) {
    e?.preventDefault();
    setMessage(null);
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setMessage(data?.detail || data?.message || "Registration failed");
        return;
      }

      setMessage("Registration successful. Redirecting to login...");
      setTimeout(() => router.push("/login"), 1200);
    } catch (err) {
      console.error(err);
      setMessage("Cannot connect to backend");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md border rounded p-6">
        <h1 className="text-2xl font-bold mb-4">Register</h1>

        <form onSubmit={handleRegister}>
          <input
            className="w-full border p-2 mb-3"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            className="w-full border p-2 mb-3"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {message ? (
            <div className="text-sm mb-3">{message}</div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full border p-2 mb-2"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="text-center mt-2">
          <Link href="/login" className="text-blue-600 underline">
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
