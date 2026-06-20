export default function DevicesPage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">
        Devices
      </h1>

      <table className="mt-6 border w-full">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Version</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td className="border p-2">device001</td>
            <td className="border p-2">1.0.0</td>
            <td className="border p-2">Online</td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}
