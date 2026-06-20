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
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md border rounded p-6">

        <h1 className="text-2xl font-bold mb-4">
          Login
        </h1>

        <form onSubmit={handleLogin}>
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

          {error ? (
            <div className="text-red-600 mb-3">{error}</div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full border p-2 mb-2"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-2">
          <span className="mr-2">No account?</span>
          <Link href="/register" className="text-blue-600 underline">
            Register
          </Link>
        </div>

      </div>
    </main>
  );
}
