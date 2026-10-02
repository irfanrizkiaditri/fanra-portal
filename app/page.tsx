'use client'

import { useEffect, useState, useCallback } from 'react'

interface ServiceStatus {
  id: string
  name: string
  description: string
  url: string
  github?: string
  status: 'online' | 'offline'
  latencyMs: number | null
  detail: string | null
}

interface StatusResponse {
  ok: boolean
  timestamp: string
  online: number
  total: number
  services: ServiceStatus[]
}

const SKILLS = [
  { name: 'Hermes Agent', desc: 'AI asisten utama — Telegram, WhatsApp, otomasi lokal' },
  { name: 'GitHub Ops', desc: 'Manajemen repo, commit, push via gh CLI' },
  { name: 'Vercel Deploy', desc: 'Deploy aplikasi web langsung dari repo' },
  { name: 'Browser Automation', desc: 'Kontrol browser real untuk scraping & QA' },
  { name: 'Deep Research', desc: 'Riset web mendalam dengan sumber terverifikasi' },
  { name: 'PM2 Process Manager', desc: 'Kelola semua service lokal dari satu titik' },
  { name: 'Web Remote Control', desc: 'Kontrol PC/laptop dari browser HP' },
  { name: 'Office & Docs', desc: 'Buat & edit dokumen, spreadsheet, presentasi' },
]

export default function Home() {
  const [data, setData] = useState<StatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [now, setNow] = useState<string>('')

  const fetchStatus = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/status', { cache: 'no-store' })
      const json = await res.json()
      setData(json)
    } catch {
      setData(null)
    } finally {
      setRefreshing(false)
      setLoading(false)
      setNow(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  const allOnline = data ? data.online === data.total && data.total > 0 : false

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        {/* Header */}
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-2xl font-black text-slate-900 shadow-lg shadow-emerald-500/20">
              F
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Fanra AI <span className="text-emerald-400">Portal</span>
              </h1>
              <p className="text-sm text-zinc-400">Pusat kendali layanan & project lokal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${allOnline ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-amber-500/40 bg-amber-500/10 text-amber-400'}`}>
              <span className={`h-2 w-2 rounded-full ${allOnline ? 'bg-emerald-400' : 'bg-amber-400'} ${refreshing ? 'animate-pulse' : ''}`} />
              {loading ? 'Memuat...' : allOnline ? `${data?.online}/${data?.total} Online` : `${data?.online ?? 0}/${data?.total ?? 0} Online`}
            </div>
            <button
              onClick={fetchStatus}
              disabled={refreshing}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10 disabled:opacity-50"
            >
              {refreshing ? '↻' : '↻ Refresh'}
            </button>
          </div>
        </header>

        {/* Hero */}
        <div className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 sm:p-8">
          <h2 className="mb-2 text-xl font-semibold sm:text-2xl">Selamat datang, Irfan 👋</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Ini portal kendali untuk semua layanan Fanra AI di laptop kamu. Cek status service,
            buka aplikasi langsung, dan kelola project — semua dari satu tempat. Update otomatis
            setiap 5 detik.
          </p>
          {now && (
            <p className="mt-4 font-mono text-xs text-zinc-500">Terakhir diperbarui: {now}</p>
          )}
        </div>

        {/* Services */}
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <span className="text-zinc-500">⚡</span> Layanan Aktif
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? [1, 2, 3].map((i) => (
                  <div key={i} className="h-48 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
                ))
              : data?.services.map((svc) => (
                  <div
                    key={svc.id}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-white/20 hover:bg-white/[0.06]"
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <h3 className="font-semibold leading-tight">{svc.name}</h3>
                      <span
                        className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          svc.status === 'online'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${svc.status === 'online' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {svc.status === 'online' ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <p className="mb-4 text-xs leading-relaxed text-zinc-400">{svc.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={svc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium transition hover:bg-white/20"
                      >
                        Buka →
                      </a>
                      {svc.github && (
                        <a
                          href={svc.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/10"
                        >
                          GitHub
                        </a>
                      )}
                    </div>
                    {svc.latencyMs !== null && (
                      <p className="mt-3 font-mono text-[10px] text-zinc-600">{svc.latencyMs}ms</p>
                    )}
                    <div
                      className={`absolute inset-x-0 top-0 h-px ${svc.status === 'online' ? 'bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent' : 'bg-gradient-to-r from-transparent via-red-400/50 to-transparent'}`}
                    />
                  </div>
                ))}
          </div>
        </section>

        {/* Skills */}
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <span className="text-zinc-500">🧠</span> Kemampuan Asisten
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SKILLS.map((skill) => (
              <div
                key={skill.name}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-white/15 hover:bg-white/[0.05]"
              >
                <h3 className="mb-1 text-sm font-semibold text-zinc-100">{skill.name}</h3>
                <p className="text-xs leading-relaxed text-zinc-500">{skill.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Info */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="mb-3 text-sm font-semibold">📁 Struktur Folder</h3>
            <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-zinc-400">
{`C:/Users/ASUS/FanraAi/
├── ruang/              3D Builder (5173)
├── remote-touchpad/    Touchpad Server (8000)
├── touchpad-dashboard/ Dashboard (3000)
├── fanra-portal/       Portal ini
├── ecosystem.config.js PM2 config
├── start-all.bat
├── stop-all.bat
└── restart-all.bat`}
            </pre>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="mb-3 text-sm font-semibold">🔗 Repo GitHub</h3>
            <div className="flex flex-col gap-2.5">
              <a href="https://github.com/irfanrizkiaditri/FanraAI" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 transition hover:border-white/15 hover:bg-white/[0.05]">
                <span className="text-xs font-medium text-zinc-300">irfanrizkiaditri/FanraAI</span>
                <span className="text-xs text-emerald-400 opacity-0 transition group-hover:opacity-100">→</span>
              </a>
              <a href="https://github.com/irfanrizkiaditri/touchpad-dashboard" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 transition hover:border-white/15 hover:bg-white/[0.05]">
                <span className="text-xs font-medium text-zinc-300">irfanrizkiaditri/touchpad-dashboard</span>
                <span className="text-xs text-emerald-400 opacity-0 transition group-hover:opacity-100">→</span>
              </a>
            </div>
          </div>
        </section>

        <footer className="mt-10 border-t border-white/[0.06] pt-6 text-center">
          <p className="text-xs text-zinc-600">
            Fanra AI Portal · Dibuat oleh Fanra AI · {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  )
}
