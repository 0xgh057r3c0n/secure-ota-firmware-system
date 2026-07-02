"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        setError(errorData?.detail || "Login failed. Check your credentials.");
        return;
      }

      const data = await response.json();

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        router.push("/dashboard");
      } else {
        setError("Login failed: invalid server response.");
      }
    } catch (err) {
      console.error(err);
      setError("Cannot connect to backend");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_25%),linear-gradient(135deg,_#020617_0%,_#0f172a_60%,_#111827_100%)] px-4 py-10 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-8 lg:flex-row">
        <div className="max-w-md rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-cyan-950/40 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Secure access</p>
          <h1 className="mt-2 text-3xl font-semibold">Sign in to the OTA console</h1>
          <p className="mt-3 text-sm text-slate-400">Authenticate with the backend API to manage firmware releases and device inventory.</p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error ? <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-slate-400">
            <span className="mr-2">No account?</span>
            <Link href="/register" className="font-medium text-cyan-400 transition hover:text-cyan-300">
              Register
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
