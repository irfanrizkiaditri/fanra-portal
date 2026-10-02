import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const LLM_BASE = process.env.LLM_BASE || 'http://localhost:20128/v1'
const LLM_KEY = process.env.LLM_KEY || process.env.LLM_API_KEY || 'portal'
const LLM_MODEL = process.env.LLM_MODEL || 'FanraAi'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `Kamu adalah Fanra AI, asisten pribadi Irfan Rizki Aditri.
Balas selalu dalam Bahasa Indonesia, singkat dan to the point.
Kamu mengelola ekosistem FanraAi: ruang (3D builder di port 5173), remote-touchpad (port 8000),
touchpad-dashboard (port 3000), dan portal ini. Semua berjalan via PM2 di laptop Windows Irfan.
Jika ditanya status service, arahkan ke panel status di portal. Jika butuh aksi ke file atau server,
katakan saja bahwa kamu akan kerjakan dari sisi terminal lokal.`

export async function POST(request: Request) {
  let body: { messages?: ChatMessage[]; message?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Body bukan JSON valid' }, { status: 400 })
  }

  const incoming = body.messages ?? (body.message ? [{ role: 'user' as const, content: body.message }] : [])
  if (incoming.length === 0) {
    return NextResponse.json({ ok: false, error: 'Pesan tidak boleh kosong' }, { status: 400 })
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...incoming.slice(-20).map((m) => ({ role: m.role, content: m.content })),
  ]

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 45000)
  try {
    const res = await fetch(`${LLM_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LLM_KEY}`,
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages,
        stream: false,
        temperature: 0.7,
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return NextResponse.json(
        { ok: false, error: `Asisten merespon status ${res.status}. ${text.slice(0, 180)}` },
        { status: 502 },
      )
    }

    const data = await res.json()
    const reply = data?.choices?.[0]?.message?.content
    if (!reply) {
      return NextResponse.json({ ok: false, error: 'Asisten tidak memberikan balasan' }, { status: 502 })
    }
    return NextResponse.json({ ok: true, reply, model: data?.model ?? LLM_MODEL })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal terhubung'
    return NextResponse.json(
      { ok: false, error: `Tidak bisa terhubung ke asisten (${message}). Asisten harus aktif di laptop.` },
      { status: 502 },
    )
  } finally {
    clearTimeout(timeout)
  }
}
