"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { apiDownload, apiGet, apiUpload, getStoredUser } from "../lib/api";

interface FirmwareItem {
  id: number;
  version: string;
  hash_value: string;
  firmware_path: string;
  signature_path: string;
  published: boolean;
  uploaded_at: string;
}

export default function FirmwarePage() {
  const [version, setVersion] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [firmwares, setFirmwares] = useState<FirmwareItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function loadFirmwares() {
      setLoadingList(true);
      try {
        const data = await apiGet("/firmware/all");
        setFirmwares(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingList(false);
      }
    }

    loadFirmwares();
  }, []);

  useEffect(() => {
    setIsAdmin(getStoredUser()?.is_admin === true || getStoredUser()?.role === "admin");
  }, []);

  async function handleUpload() {
    if (!version || !file) {
      setStatus("Please enter a version and select a firmware file.");
      return;
    }

    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("version", version);
    formData.append("file", file);

    try {
      const data = await apiUpload("/firmware/upload", formData);
      setStatus(`Uploaded firmware ${data.version} successfully.`);
      setVersion("");
      setFile(null);
      const refreshed = await apiGet("/firmware/all");
      setFirmwares(Array.isArray(refreshed) ? refreshed : []);
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(id: number, version: string) {
    setLoading(true);
    setStatus(null);

    try {
      const blob = await apiDownload(`/firmware/download/${id}`);
      if (!blob || blob.size === 0) {
        throw new Error("Downloaded file is empty.");
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `firmware-${version}.bin`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      setStatus(`Downloaded firmware ${version}.`);
    } catch (error) {
      console.error("Firmware download failed:", error);
      setStatus(error instanceof Error ? error.message : "Could not download firmware.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute>
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        {isAdmin ? (
          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-violet-950/30">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">Firmware release</p>
            <h1 className="mt-2 text-3xl font-semibold">Publish a new OTA package</h1>
            <p className="mt-3 text-sm text-slate-400">Upload a signed firmware artifact and store it in the backend repository.</p>

            <div className="mt-6 space-y-4">
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none ring-0"
                placeholder="Version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />

              <input
                className="w-full rounded-2xl border border-dashed border-white/15 bg-slate-950/60 px-4 py-3 text-sm text-slate-300"
                type="file"
                onChange={(event) => {
                  const selectedFile = event.target.files?.[0] ?? null;
                  setFile(selectedFile);
                }}
              />

              <button
                className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleUpload}
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload firmware"}
              </button>

              {status ? <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">{status}</div> : null}
            </div>
          </section>
        ) : (
          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-violet-950/30">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">Firmware updates</p>
            <h1 className="mt-2 text-3xl font-semibold">Download the latest verified release</h1>
            <p className="mt-3 text-sm text-slate-400">Regular users can download the latest signed firmware package for installation.</p>
          </section>
        )}

        <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Stored firmware releases</h2>
              <p className="mt-1 text-sm text-slate-400">A live list from the backend firmware endpoint.</p>
            </div>
            <div className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-sm text-slate-400">{firmwares.length} items</div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-slate-950/70 text-left text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Version</th>
                  <th className="px-4 py-3 font-medium">Hash</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-slate-900/60">
                {loadingList ? (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400">Loading firmware list...</td></tr>
                ) : firmwares.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400">No firmware found.</td></tr>
                ) : (
                  firmwares.map((firmware) => (
                    <tr key={firmware.id}>
                      <td className="px-4 py-3 font-medium">{firmware.version}</td>
                      <td className="px-4 py-3 text-slate-400">{firmware.hash_value.slice(0, 16)}…</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            className="rounded-2xl bg-cyan-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300 transition hover:bg-cyan-500/20"
                            onClick={() => handleDownload(firmware.id, firmware.version)}
                            disabled={loading}
                          >
                            Download
                          </button>
                          {isAdmin ? (
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${firmware.published ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
                              {firmware.published ? "Published" : "Queued"}
                            </span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
    </ProtectedRoute>
  );
}
