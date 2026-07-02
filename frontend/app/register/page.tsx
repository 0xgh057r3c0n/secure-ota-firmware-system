"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "../lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleRegister(e?: React.FormEvent) {
    e?.preventDefault();
    setMessage(null);

    if (!email || !username || !password) {
      setMessage("Email, username, and password are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (username.length < 3 || username.length > 32) {
      setMessage("Username must be between 3 and 32 characters.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password })
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_25%),linear-gradient(135deg,_#020617_0%,_#0f172a_60%,_#111827_100%)] px-4 py-10 text-slate-100">
      <div className="mx-auto flex max-w-6xl items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-violet-950/40 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">Create account</p>
          <h1 className="mt-2 text-3xl font-semibold">Register for OTA access</h1>
          <p className="mt-3 text-sm text-slate-400">Create an account to sign in, register your device, and receive firmware update notifications.</p>

          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {message ? <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-300">{message}</div> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-slate-400">
            <Link href="/login" className="font-medium text-cyan-400 transition hover:text-cyan-300">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
