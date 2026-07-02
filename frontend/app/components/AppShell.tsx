"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isAdminUser } from "../lib/api";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    setAdmin(isAdminUser());
  }, []);

  return (
    <>
      <header className="border-b p-4 bg-slate-50">
        <nav className="flex flex-wrap gap-4 items-center">
          <Link href="/" className="font-semibold">
            Home
          </Link>
          <Link href="/login">Login</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/devices">Devices</Link>
          <Link href="/firmware">Firmware</Link>
          {admin ? <Link href="/logs">Logs</Link> : null}
        </nav>
      </header>

      <main className="flex-1">{children}</main>
    </>
  );
}
