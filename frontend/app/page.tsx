import Link from "next/link";

const featureCards = [
  { href: "/dashboard", title: "Live operations dashboard", detail: "Real-time fleet health and release visibility" },
  { href: "/devices", title: "Fleet device monitoring", detail: "Track enrolled devices and deployment state" },
  { href: "/firmware", title: "Firmware release workflow", detail: "Secure uploads, versioning, and rollout control" },
  { href: "/logs", title: "Immutable audit trail", detail: "Review signed events and access history" }
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_26%),linear-gradient(135deg,_#020617_0%,_#0f172a_60%,_#111827_100%)] px-6 py-16 text-slate-100 sm:px-8 lg:px-10">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30" />
        <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle,_rgba(34,211,238,0.7)_1px,_transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
            <span className="h-2 w-2 rounded-full bg-cyan-400" /> Secure OTA platform
          </div>
          <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Secure firmware delivery for the next generation of connected systems.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
            Orchestrate trusted updates, monitor every device, and keep your release pipeline auditable from a single professional operations console.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className="rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-600 px-5 py-3 font-medium text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02] hover:opacity-95">
              Open console
            </Link>
            <Link href="/dashboard" className="rounded-full border border-white/15 bg-white/10 px-5 py-3 font-medium text-slate-100 backdrop-blur transition hover:bg-white/20">
              Explore dashboard
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-400">
            <div className="rounded-full border border-white/10 bg-slate-900/60 px-4 py-2">Encrypted release workflows</div>
            <div className="rounded-full border border-white/10 bg-slate-900/60 px-4 py-2">Role-aware access control</div>
            <div className="rounded-full border border-white/10 bg-slate-900/60 px-4 py-2">Audit-ready operations</div>
          </div>
        </div>

        <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Operations view</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Mission control</h2>
            </div>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">Live</div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {featureCards.map(({ href, title, detail }) => (
              <Link key={href} href={href} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300 transition hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-slate-900">
                <span className="block font-medium text-slate-100">{title}</span>
                <span className="mt-2 block text-xs leading-5 text-slate-400">{detail}</span>
                <span className="mt-3 block text-[11px] uppercase tracking-[0.25em] text-cyan-400">{href}</span>
              </Link>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-4">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Secure pipeline status</span>
              <span className="font-semibold text-cyan-300">Nominal</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-800">
              <div className="h-2 w-4/5 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" />
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.25em] text-slate-500">Signed updates • Verified devices • Audited actions</p>
          </div>
        </div>
      </div>
    </main>
  );
}
