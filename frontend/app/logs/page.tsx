"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

interface AuditLogItem {
  id: number;
  action: string;
  actor: string;
  details: string;
  timestamp: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      setError(null);

      try {
        const data = await apiGet("/logs");
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Could not load audit logs.");
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Audit Logs</h1>

      {loading ? (
        <div className="mt-6">Loading audit logs...</div>
      ) : error ? (
        <div className="mt-6 text-red-600">{error}</div>
      ) : logs.length === 0 ? (
        <div className="mt-6">No audit logs found.</div>
      ) : (
        <div className="mt-6 space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="border rounded p-4 bg-white shadow-sm"
            >
              <div className="text-sm text-slate-500">
                {new Date(log.timestamp).toLocaleString()}
              </div>
              <div className="font-semibold mt-1">{log.action}</div>
              <div className="text-sm text-slate-500">
                Actor: {log.actor}
              </div>
              <div className="mt-2 text-sm text-slate-700">
                {log.details}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
