"use client";

import {
  useEffect,
  useState
} from "react";
import { API_URL } from "../../lib/api";

export default function FirmwareHistory() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch(`${API_URL}/firmware/all`);
    const data = await res.json();
    setItems(data || []);
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">
        Firmware History
      </h1>

      <table className="w-full border mt-4">
        <thead>
          <tr>
            <th>Version</th>
            <th>Firmware File</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const filename = item.firmware_path
              ? item.firmware_path.split("/").pop()
              : "Unknown";

            return (
              <tr key={item.id}>
                <td>{item.version}</td>
                <td>{filename}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
