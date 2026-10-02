import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface ServiceInfo {
  id: string
  name: string
  url: string
  description: string
  github?: string
}

const SERVICE_HOST = process.env.SERVICE_HOST || 'http://localhost'

interface ServiceDef {
  id: string
  name: string
  port: number
  path: string
  description: string
  github?: string
}

const SERVICE_DEFS: ServiceDef[] = [
  {
    id: 'ruang',
    name: 'Ruang 3D Builder',
    port: 5173,
    path: '/',
    description: 'Workspace 3D builder — desain ruang kerja dengan drag & drop aset, AI generative design, undo/redo, full-page mode.',
    github: 'https://github.com/irfanrizkiaditri/FanraAI',
  },
  {
    id: 'touchpad',
    name: 'Remote Touchpad Server',
    port: 8000,
    path: '/',
    description: 'Server FastAPI + WebSocket untuk kontrol kursor laptop dari browser HP. Gestur multi-sentuh, media control, keyboard virtual.',
    github: 'https://github.com/irfanrizkiaditri/FanraAI',
  },
  {
    id: 'dashboard',
    name: 'Touchpad Dashboard',
    port: 3000,
    path: '/',
    description: 'Dashboard Next.js untuk monitor status & konfigurasi remote touchpad server secara real-time.',
    github: 'https://github.com/irfanrizkiaditri/touchpad-dashboard',
  },
]

function getServiceInfo(def: ServiceDef): ServiceInfo {
  return {
    id: def.id,
    name: def.name,
    url: `${SERVICE_HOST}:${def.port}${def.path}`,
    description: def.description,
    github: def.github,
  }
}

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

async function checkService(service: ServiceInfo): Promise<ServiceStatus> {
  const started = Date.now()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3000)
  try {
    const res = await fetch(service.url, { signal: controller.signal })
    const latency = Date.now() - started
    let detail = null
    if (service.id === 'touchpad') {
      try {
        const health = await fetch(`${service.url}/health`, { signal: controller.signal })
        detail = await health.text()
      } catch {}
    }
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      url: service.url,
      github: service.github,
      status: res.ok ? 'online' : 'offline',
      latencyMs: latency,
      detail,
    }
  } catch {
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      url: service.url,
      github: service.github,
      status: 'offline',
      latencyMs: null,
      detail: null,
    }
  } finally {
    clearTimeout(timeout)
  }
}

export async function GET() {
  const statuses = await Promise.all(SERVICE_DEFS.map((def) => checkService(getServiceInfo(def))))
  const onlineCount = statuses.filter((s) => s.status === 'online').length
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    online: onlineCount,
    total: statuses.length,
    services: statuses,
  })
}
