import Link from "next/link";

export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold">
        Secure OTA Firmware System
      </h1>

      <ul className="mt-6 space-y-2 text-blue-600">
        <li>
          <Link href="/login" className="underline">
            Login
          </Link>
        </li>
        <li>
          <Link href="/dashboard" className="underline">
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/devices" className="underline">
            Devices
          </Link>
        </li>
        <li>
          <Link href="/firmware" className="underline">
            Firmware
          </Link>
        </li>
        <li>
          <Link href="/logs" className="underline">
            Logs
          </Link>
        </li>
      </ul>
    </main>
  );
}
