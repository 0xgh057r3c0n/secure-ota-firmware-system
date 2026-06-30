"use client";

import { useState } from "react";
import { API_URL } from "../lib/api";

export default function FirmwarePage() {
  const [version, setVersion] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const res = await fetch(`${API_URL}/firmware/upload`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.detail || "Firmware upload failed.");
        return;
      }

      setStatus(
        `Uploaded firmware ${data.version} successfully.`
      );
      setVersion("");
      setFile(null);
    } catch (error) {
      console.error(error);
      setStatus("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Firmware Upload</h1>

      <div className="max-w-md mt-6 space-y-3">
        <input
          className="border p-2 w-full"
          placeholder="Version"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
        />

        <input
          className="border p-2 w-full"
          type="file"
          onChange={(event) => {
            const selectedFile =
              event.target.files?.[0] ?? null;
            setFile(selectedFile);
          }}
        />

        <button
          className="border p-2 w-full"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload Firmware"}
        </button>

        {status ? (
          <div className="mt-3 p-3 border rounded">
            {status}
          </div>
        ) : null}
      </div>
    </main>
  );
}
