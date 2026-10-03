import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface ServiceDef {
  id: string
  name: string
  port: number
  description: string
  github?: string
}

// URL publik ke setiap service di laptop Irfan.
// Di-override lewat env di Vercel; default memakai tunnel aktif saat ini.
const DEFAULT_URLS: Record<string, string> = {
  ruang: 'https://baths-groundwater-compiler-sys.trycloudflare.com',
  touchpad: 'https://lucas-norman-ipod-need.trycloudflare.com',
  dashboard: 'https://ralph-oak-showing-lean.trycloudflare.com',
}

const SERVICE_DEFS: ServiceDef[] = [
  {
    id: 'ruang',
    name: 'Ruang 3D Builder',
    port: 5173,
    description:
      'Workspace 3D builder. Desain ruang kerja dengan drag and drop aset, AI generative design, undo redo, dan full-page mode.',
    github: 'https://github.com/irfanrizkiaditri/FanraAI',
  },
  {
    id: 'touchpad',
    name: 'Remote Touchpad Server',
    port: 8000,
    description:
      'Server FastAPI dan WebSocket untuk kontrol kursor laptop dari browser HP. Gestur multi-sentuh, media control, keyboard virtual.',
    github: 'https://github.com/irfanrizkiaditri/FanraAI',
  },
  {
    id: 'dashboard',
    name: 'Touchpad Dashboard',
    port: 3000,
    description:
      'Dashboard Next.js untuk monitor status dan konfigurasi remote touchpad server secara real-time.',
    github: 'https://github.com/irfanrizkiaditri/touchpad-dashboard',
  },
]

interface ServiceStatus {
  id: string
  name: string
  port: number
  description: string
  url: string
  github?: string
  status: 'online' | 'offline'
  latencyMs: number | null
  detail: string | null
}

// Sumber URL tunnel: file public-tunnels.json di repo GitHub FanraAI.
// Laptop Irfan update file ini otomatis tiap tunnel dibuat (sync-tunnels.bat),
// jadi portal selalu tahu URL terbaru tanpa perlu set env Vercel manual.
const TUNNELS_JSON_URL =
  'https://raw.githubusercontent.com/irfanrizkiaditri/FanraAI/main/public-tunnels.json'

let cachedTunnels: Record<string, string> | null = null
let cacheTime = 0

async function fetchTunnels(): Promise<Record<string, string>> {
  // Cache 30 detik biar tidak spam GitHub
  const now = Date.now()
  if (cachedTunnels && now - cacheTime < 30_000) return cachedTunnels
  try {
    const res = await fetch(TUNNELS_JSON_URL, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      cachedTunnels = data
      cacheTime = now
      return data
    }
  } catch {
    // GitHub tidak bisa diakses, fallback ke default
  }
  return {}
}

async function resolveUrl(def: ServiceDef): Promise<string> {
  // Prioritas: env Vercel > tunnels.json dari GitHub > default hardcoded
  const fromEnv = process.env[`SERVICE_URL_${def.id.toUpperCase()}`]
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  const tunnels = await fetchTunnels()
  const fromJson = tunnels[def.id]
  if (fromJson) return fromJson.replace(/\/$/, '')
  return DEFAULT_URLS[def.id]
}

async function checkService(def: ServiceDef): Promise<ServiceStatus> {
  const url = await resolveUrl(def)
  const started = Date.now()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  try {
    const res = await fetch(url, { signal: controller.signal })
    const latency = Date.now() - started
    let detail: string | null = null
    if (def.id === 'touchpad') {
      try {
        const health = await fetch(`${url}/health`, { signal: controller.signal })
        detail = (await health.text()).slice(0, 120)
      } catch {}
    }
    return {
      ...def,
      url,
      status: res.ok ? 'online' : 'offline',
      latencyMs: latency,
      detail,
    }
  } catch {
    return { ...def, url, status: 'offline', latencyMs: null, detail: null }
  } finally {
    clearTimeout(timeout)
  }
}

export async function GET() {
  const statuses = await Promise.all(SERVICE_DEFS.map(checkService))
  const onlineCount = statuses.filter((s) => s.status === 'online').length
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    online: onlineCount,
    total: statuses.length,
    services: statuses,
  })
}
