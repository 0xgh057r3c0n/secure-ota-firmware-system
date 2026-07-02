"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../components/ProtectedRoute";
import { apiGet, getStoredUser } from "../lib/api";

interface DashboardStats {
  devices: number;
  firmwares: number;
}

interface DeviceItem {
  id: number;
  device_id: string;
  current_version: string;
  status: string;
  last_seen: string | null;
}

interface FirmwareItem {
  id: number;
  version: string;
  hash_value: string;
  firmware_path: string;
  signature_path: string;
  published: boolean;
  uploaded_at: string;
}

interface LogItem {
  id: number;
  action: string;
  actor: string;
  details: string;
  timestamp: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({ devices: 0, firmwares: 0 });
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [firmwares, setFirmwares] = useState<FirmwareItem[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    router.push("/login");
  }

  useEffect(() => {
    setIsAdmin(getStoredUser()?.is_admin === true || getStoredUser()?.role === "admin");

    async function loadDashboardData() {
      setLoading(true);
      setError(null);

      try {
        const [statsData, deviceData, firmwareData, logData] = await Promise.all([
          apiGet("/dashboard/stats"),
          apiGet("/device/all"),
          apiGet("/firmware/all"),
          apiGet("/logs")
        ]);

        setStats({
          devices: statsData.devices ?? 0,
          firmwares: statsData.firmwares ?? 0
        });
        setDevices(Array.isArray(deviceData) ? deviceData : []);
        setFirmwares(Array.isArray(firmwareData) ? firmwareData : []);
        setLogs(Array.isArray(logData) ? logData.slice(0, 5) : []);
      } catch (err) {
        console.error(err);
        setError("Unable to load dashboard data from the backend API.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const chartMax = Math.max(5, stats.devices, stats.firmwares, logs.length);
  const chartBars = [
    { label: "Devices", value: stats.devices, color: "from-cyan-500 to-sky-600" },
    { label: "Firmware", value: stats.firmwares, color: "from-violet-500 to-indigo-600" },
    { label: "Events", value: logs.length, color: "from-emerald-500 to-teal-600" }
  ];

  return (
    <ProtectedRoute>
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#0f172a_60%,_#111827_100%)] text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:px-8">
        <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-950/40 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Secure OTA Operations</p>
              <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{isAdmin ? "Firmware fleet overview" : "Update center"}</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                {isAdmin
                  ? "Monitor registered devices, firmware releases, and recent activity from the connected backend API in real time."
                  : "Install approved updates and stay informed about new firmware releases without accessing broader admin controls."}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/20"
            >
              Logout
            </button>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-5 shadow-lg shadow-cyan-950/30">
            <div className="text-sm text-slate-400">Registered devices</div>
            <div className="mt-2 text-3xl font-semibold">{loading ? "—" : stats.devices}</div>
            <div className="mt-2 text-sm text-cyan-400">Connected to /device/all</div>
          </div>
          <div className="rounded-2xl border border-violet-500/20 bg-slate-900/70 p-5 shadow-lg shadow-violet-950/30">
            <div className="text-sm text-slate-400">Firmware versions</div>
            <div className="mt-2 text-3xl font-semibold">{loading ? "—" : stats.firmwares}</div>
            <div className="mt-2 text-sm text-violet-400">Connected to /firmware/all</div>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/70 p-5 shadow-lg shadow-emerald-950/30">
            <div className="text-sm text-slate-400">Latest activity</div>
            <div className="mt-2 text-3xl font-semibold">{loading ? "—" : logs.length}</div>
            <div className="mt-2 text-sm text-emerald-400">Connected to /logs</div>
          </div>
        </section>

        {isAdmin ? (
          <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Release footprint</h2>
                <p className="mt-1 text-sm text-slate-400">A quick health snapshot of the OTA network.</p>
              </div>
            </div>
            <div className="mt-6 h-56 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <svg viewBox="0 0 320 180" className="h-full w-full">
                <defs>
                  <linearGradient id="bar-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#0369a1" />
                  </linearGradient>
                  <linearGradient id="bar-violet" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#4338ca" />
                  </linearGradient>
                  <linearGradient id="bar-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#0f766e" />
                  </linearGradient>
                </defs>
                {chartBars.map((bar, index) => {
                  const height = Math.max(18, (bar.value / chartMax) * 100);
                  const x = 40 + index * 100;
                  const y = 140 - height;
                  const fillId = bar.label === "Devices" ? "bar-cyan" : bar.label === "Firmware" ? "bar-violet" : "bar-emerald";
                  return (
                    <g key={bar.label}>
                      <rect x={x} y={y} width="60" height={height} rx="10" fill={`url(#${fillId})`} />
                      <text x={x + 30} y="162" textAnchor="middle" className="fill-slate-400 text-[10px]">{bar.label}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/30">
            <h2 className="text-xl font-semibold">Recent firmware</h2>
            <div className="mt-4 space-y-3">
              {firmwares.slice(0, 3).map((firmware) => (
                <div key={firmware.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{firmware.version}</span>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${firmware.published ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
                      {firmware.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{firmware.hash_value.slice(0, 16)}…</p>
                </div>
              ))}
              {firmwares.length === 0 ? <p className="text-sm text-slate-400">No firmware entries yet.</p> : null}
            </div>
          </div>
          </section>
        ) : (
          <section className="rounded-3xl border border-cyan-500/20 bg-slate-900/70 p-6 shadow-lg shadow-cyan-950/30">
            <h2 className="text-xl font-semibold">Your update workflow</h2>
            <p className="mt-2 text-sm text-slate-300">You can review the latest approved release, install it on your device, and receive notifications when a new update is published.</p>
            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Latest release</span>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">Ready</span>
              </div>
              <p className="mt-3 text-sm text-slate-400">Install the newest verified firmware build when it becomes available.</p>
            </div>
          </section>
        )}

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/30">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{isAdmin ? "Connected devices" : "Update notifications"}</h2>
              <span className="text-sm text-slate-400">{isAdmin ? `${devices.length} active` : "Release alerts"}</span>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              {isAdmin ? (
                <table className="min-w-full divide-y divide-white/10 text-sm">
                <thead className="bg-slate-950/70 text-left text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Device</th>
                    <th className="px-4 py-3 font-medium">Version</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-slate-900/50">
                  {devices.map((device) => (
                    <tr key={device.id}>
                      <td className="px-4 py-3 font-medium">{device.device_id}</td>
                      <td className="px-4 py-3 text-slate-300">{device.current_version}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${device.status === "online" ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-500/15 text-slate-300"}`}>
                          {device.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {devices.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-4 text-center text-slate-400">No devices reported yet.</td>
                    </tr>
                  ) : null}
                </tbody>
                </table>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
                  You will receive notifications whenever an approved firmware release is published.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/30">
            <h2 className="text-xl font-semibold">Recent activity</h2>
            <div className="mt-4 space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                  <div className="text-sm font-medium">{log.action}</div>
                  <div className="mt-1 text-xs text-slate-400">{log.actor}</div>
                  <div className="mt-1 text-xs text-slate-500">{log.details}</div>
                </div>
              ))}
              {logs.length === 0 ? <p className="text-sm text-slate-400">No activity yet.</p> : null}
            </div>
          </div>
        </section>
      </div>
    </main>
    </ProtectedRoute>
  );
}
