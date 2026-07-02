"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { apiGet, apiPost } from "../lib/api";

interface DeviceItem {
  id: number;
  device_id: string;
  current_version: string;
  status: string;
  last_seen: string | null;
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState("");
  const [currentVersion, setCurrentVersion] = useState("");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadDevices() {
      setLoading(true);
      setError(null);

      try {
        const data = await apiGet("/device/all");
        setDevices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Could not load devices from the backend API.");
      } finally {
        setLoading(false);
      }
    }

    loadDevices();
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setSubmitMessage(null);

    if (!deviceId.trim() || !currentVersion.trim()) {
      setSubmitMessage("Device ID and current version are required.");
      return;
    }

    setSubmitting(true);

    try {
      const data = await apiPost("/device/register", {
        device_id: deviceId.trim(),
        current_version: currentVersion.trim()
      });

      setSubmitMessage(typeof data === "string" ? data : data.message || "Device registered successfully.");
      setDeviceId("");
      setCurrentVersion("");
      const refreshed = await apiGet("/device/all");
      setDevices(Array.isArray(refreshed) ? refreshed : []);
    } catch (err) {
      console.error(err);
      setSubmitMessage(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ProtectedRoute>
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-950/40">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Device inventory</p>
              <h1 className="mt-2 text-3xl font-semibold">Fleet management</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-400">Register new devices and review the current fleet.</p>
            </div>
            <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
              {devices.length} devices tracked
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.6fr_1.4fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/30">
            <h2 className="text-xl font-semibold">Register a new device</h2>
            <p className="mt-2 text-sm text-slate-400">Enter the device ID and the version currently installed on the device.</p>

            <form onSubmit={handleRegister} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Device ID</label>
                <input
                  type="text"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none"
                  placeholder="e.g. device-001"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Current Version</label>
                <input
                  type="text"
                  value={currentVersion}
                  onChange={(e) => setCurrentVersion(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none"
                  placeholder="e.g. 1.0.0"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Registering..." : "Register Device"}
              </button>

              {submitMessage ? (
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">{submitMessage}</div>
              ) : null}
            </form>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/30">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-sm">
                <thead className="bg-slate-950/70 text-left text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Device ID</th>
                    <th className="px-4 py-3 font-medium">Version</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Last seen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-slate-900/60">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-400">Loading devices...</td>
                    </tr>
                  ) : devices.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-400">No devices available.</td>
                    </tr>
                  ) : (
                    devices.map((device) => (
                      <tr key={device.id}>
                        <td className="px-4 py-3 font-medium">{device.device_id}</td>
                        <td className="px-4 py-3 text-slate-300">{device.current_version}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${device.status === "online" ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-500/15 text-slate-300"}`}>
                            {device.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{device.last_seen ? new Date(device.last_seen).toLocaleString() : "Unknown"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
    </ProtectedRoute>
  );
}
