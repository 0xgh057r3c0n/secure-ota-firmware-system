"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "../lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    devices: 0,
    firmwares: 0
  });

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    router.push("/login");
  }

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await apiGet("/dashboard/stats");
        setStats({
          devices: data.devices ?? 0,
          firmwares: data.firmwares ?? 0
        });
      } catch (error) {
        console.error(error);
      }
    }

    loadStats();
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="flex items-center justify-between mt-4">
        <div />
        <button
          onClick={handleLogout}
          className="border px-3 py-1 rounded text-sm"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="border p-4 rounded">
          <div className="text-sm text-slate-500">
            Registered Devices
          </div>
          <div className="text-2xl font-semibold">
            {stats.devices}
          </div>
        </div>

        <div className="border p-4 rounded">
          <div className="text-sm text-slate-500">
            Firmware Versions
          </div>
          <div className="text-2xl font-semibold">
            {stats.firmwares}
          </div>
        </div>

        <div className="border p-4 rounded">
          <div className="text-sm text-slate-500">
            Active Updates
          </div>
          <div className="text-2xl font-semibold">
            {stats.firmwares > 0 ? 1 : 0}
          </div>
        </div>
      </div>
    </main>
  );
}
