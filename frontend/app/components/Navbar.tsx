"use client";

import Link from "next/link";

export default function Navbar() {

  return (
    <nav className="border-b p-4 flex gap-4">

      <Link href="/dashboard">
        Dashboard
      </Link>

      <Link href="/devices">
        Devices
      </Link>

      <Link href="/firmware">
        Firmware
      </Link>

      <Link href="/logs">
        Logs
      </Link>

    </nav>
  );
}
