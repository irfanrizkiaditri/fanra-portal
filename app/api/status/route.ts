import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface ServiceDef {
  id: string
  name: string
  port: number
  path: string
  description: string
  github?: string
}

const SERVICE_HOST = process.env.SERVICE_HOST || 'http://localhost'

const SERVICE_DEFS: ServiceDef[] = [
  {
    id: 'ruang',
    name: 'Ruang 3D Builder',
    port: 5173,
    path: '/',
    description:
      'Workspace 3D builder. Desain ruang kerja dengan drag and drop aset, AI generative design, undo redo, dan full-page mode.',
    github: 'https://github.com/irfanrizkiaditri/FanraAI',
  },
  {
    id: 'touchpad',
    name: 'Remote Touchpad Server',
    port: 8000,
    path: '/',
    description:
      'Server FastAPI dan WebSocket untuk kontrol kursor laptop dari browser HP. Gestur multi-sentuh, media control, keyboard virtual.',
    github: 'https://github.com/irfanrizkiaditri/FanraAI',
  },
  {
    id: 'dashboard',
    name: 'Touchpad Dashboard',
    port: 3000,
    path: '/',
    description:
      'Dashboard Next.js untuk monitor status dan konfigurasi remote touchpad server secara real-time.',
    github: 'https://github.com/irfanrizkiaditri/touchpad-dashboard',
  },
]

interface ServiceStatus extends ServiceDef {
  url: string
  status: 'online' | 'offline'
  latencyMs: number | null
  detail: string | null
}

async function checkService(def: ServiceDef): Promise<ServiceStatus> {
  const url = `${SERVICE_HOST}:${def.port}${def.path}`
  const started = Date.now()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3500)
  try {
    const res = await fetch(url, { signal: controller.signal })
    const latency = Date.now() - started
    let detail: string | null = null
    if (def.id === 'touchpad') {
      try {
        const health = await fetch(`${SERVICE_HOST}:${def.port}/health`, { signal: controller.signal })
        detail = await health.text()
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
    host: SERVICE_HOST,
    online: onlineCount,
    total: statuses.length,
    services: statuses,
  })
}
