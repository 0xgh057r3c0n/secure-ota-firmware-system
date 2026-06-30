import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Secure OTA Firmware System",
  description: "Firmware management dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b p-4 bg-slate-50">
          <nav className="flex flex-wrap gap-4 items-center">
            <Link href="/" className="font-semibold">
              Home
            </Link>
            <Link href="/login">Login</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/devices">Devices</Link>
            <Link href="/firmware">Firmware</Link>
            <Link href="/logs">Logs</Link>
          </nav>
        </header>

        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
