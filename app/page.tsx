'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

interface ServiceStatus {
  id: string
  name: string
  port: number
  description: string
  url: string
  github?: string
  status: 'online' | 'offline'
  latencyMs: number | null
}

interface StatusResponse {
  ok: boolean
  timestamp: string
  host: string
  online: number
  total: number
  services: ServiceStatus[]
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const REPOS = [
  { label: 'irfanrizkiaditri/FanraAI', url: 'https://github.com/irfanrizkiaditri/FanraAI' },
  { label: 'irfanrizkiaditri/touchpad-dashboard', url: 'https://github.com/irfanrizkiaditri/touchpad-dashboard' },
  { label: 'irfanrizkiaditri/fanra-portal', url: 'https://github.com/irfanrizkiaditri/fanra-portal' },
]

export default function Home() {
  const [data, setData] = useState<StatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<string>('')

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  const fetchStatus = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/status', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: StatusResponse = await res.json()
      setData(json)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memuat'
      setError(`Tidak bisa memuat status (${message}). Coba refresh manual.`)
      setData(null)
    } finally {
      setRefreshing(false)
      setLoading(false)
      setUpdatedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 10000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages, sending])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || sending) return
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setSending(true)
    setChatError(null)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        setChatError(json.error ?? 'Gagal mengirim pesan')
        return
      }
      setMessages([...next, { role: 'assistant', content: json.reply }])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal terhubung'
      setChatError(`Tidak bisa menghubungi asisten (${message}).`)
    } finally {
      setSending(false)
    }
  }, [input, messages, sending])

  const allOnline = data ? data.online === data.total && data.total > 0 : false

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 border-b border-[#e2e6ec] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#14181f] text-lg font-bold text-white">
              F
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Fanra AI Portal</h1>
              <p className="text-sm text-[#5a6472]">Pusat kendali layanan dan project</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium ${
                loading
                  ? 'border-[#e2e6ec] bg-[#f6f7f9] text-[#5a6472]'
                  : allOnline
                    ? 'border-[#0d7a52]/30 bg-[#0d7a52]/10 text-[#0a6b48]'
                    : 'border-[#c0392b]/30 bg-[#c0392b]/10 text-[#962c20]'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${loading ? 'bg-[#9aa4b2]' : allOnline ? 'bg-[#0d7a52]' : 'bg-[#c0392b]'}`}
              />
              {loading
                ? 'Memuat status'
                : allOnline
                  ? `${data?.online}/${data?.total} service online`
                  : `${data?.online ?? 0}/${data?.total ?? 0} service online`}
            </div>
            <button
              onClick={fetchStatus}
              disabled={refreshing}
              className="rounded-md border border-[#e2e6ec] bg-white px-3 py-2 text-sm font-medium text-[#14181f] transition hover:bg-[#f6f7f9] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14181f]"
            >
              {refreshing ? 'Memuat...' : 'Refresh'}
            </button>
          </div>
        </header>

        {/* Status section */}
        <section className="mb-12">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-base font-semibold">Status Layanan</h2>
            <p className="font-mono text-xs text-[#5a6472]">
              {updatedAt ? `Update ${updatedAt}` : 'Belum ada data'}
            </p>
          </div>

          {error ? (
            <div className="rounded-lg border border-[#c0392b]/30 bg-[#c0392b]/5 p-4">
              <p className="text-sm text-[#962c20]">{error}</p>
              <button
                onClick={fetchStatus}
                className="mt-3 rounded-md border border-[#c0392b]/40 px-3 py-1.5 text-xs font-medium text-[#962c20] transition hover:bg-[#c0392b]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c0392b]"
              >
                Coba lagi
              </button>
            </div>
          ) : loading ? (
            <div className="rounded-lg border border-[#e2e6ec] bg-[#f6f7f9] p-4">
              <p className="text-sm text-[#5a6472]">Sedang memeriksa setiap service di laptop...</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data?.services.map((svc) => (
                <div
                  key={svc.id}
                  className="flex flex-col rounded-lg border border-[#e2e6ec] bg-white p-4 transition hover:border-[#c8cfda]"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold leading-tight">{svc.name}</h3>
                    <span
                      className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                        svc.status === 'online'
                          ? 'bg-[#0d7a52]/10 text-[#0a6b48]'
                          : 'bg-[#c0392b]/10 text-[#962c20]'
                      }`}
                    >
                      {svc.status === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <p className="mb-3 text-xs leading-relaxed text-[#5a6472]">{svc.description}</p>
                  <p className="mb-3 font-mono text-xs text-[#5a6472]">
                    :{svc.port}
                    {svc.latencyMs !== null && ` · ${svc.latencyMs}ms`}
                  </p>
                  <div className="mt-auto flex gap-2">
                    <a
                      href={svc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md bg-[#14181f] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#2a323d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14181f]"
                    >
                      Buka
                    </a>
                    {svc.github && (
                      <a
                        href={svc.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md border border-[#e2e6ec] px-3 py-1.5 text-xs font-medium text-[#14181f] transition hover:bg-[#f6f7f9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14181f]"
                      >
                        Repo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {data?.host && (
            <p className="mt-3 font-mono text-xs text-[#5a6472]">Host: {data.host}</p>
          )}
        </section>

        {/* Chat section */}
        <section className="mb-12">
          <h2 className="mb-4 text-base font-semibold">Chat dengan Fanra AI</h2>
          <div className="flex flex-col rounded-lg border border-[#e2e6ec] bg-white">
            <div
              ref={chatScrollRef}
              className="min-h-[200px] max-h-[360px] overflow-y-auto p-4"
              aria-live="polite"
            >
              {messages.length === 0 && !chatError ? (
                <p className="py-6 text-center text-sm text-[#5a6472]">
                  Belum ada percakapan. Ketik pesan di bawah untuk mulai.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-[#14181f] text-white'
                            : 'bg-[#f6f7f9] text-[#14181f]'
                        }`}
                      >
                        <p className="mb-1 text-[10px] font-medium uppercase tracking-wide opacity-60">
                          {msg.role === 'user' ? 'Irfan' : 'Fanra AI'}
                        </p>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {sending && (
                    <div className="flex justify-start">
                      <div className="rounded-lg bg-[#f6f7f9] px-3.5 py-2.5 text-sm text-[#5a6472]">
                        Fanra AI sedang mengetik...
                      </div>
                    </div>
                  )}
                  {chatError && (
                    <div className="rounded-lg border border-[#c0392b]/30 bg-[#c0392b]/5 px-3.5 py-2.5 text-sm text-[#962c20]">
                      {chatError}
                    </div>
                  )}
                </div>
              )}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void sendMessage()
              }}
              className="flex gap-2 border-t border-[#e2e6ec] p-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tulis pesan ke Fanra AI..."
                disabled={sending}
                aria-label="Pesan ke Fanra AI"
                className="min-w-0 flex-1 rounded-md border border-[#e2e6ec] bg-white px-3.5 py-2.5 text-sm text-[#14181f] placeholder:text-[#6b7686] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14181f] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="shrink-0 rounded-md bg-[#0d7a52] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#0a6b48] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d7a52] disabled:opacity-50"
              >
                {sending ? 'Mengirim...' : 'Kirim'}
              </button>
            </form>
          </div>
          <p className="mt-2 text-xs text-[#5a6472]">
            Asisten harus aktif di laptop untuk membalas. Pesan dijalankan melalui model FanraAi lokal.
          </p>
        </section>

        {/* Repos */}
        <section className="mb-8">
          <h2 className="mb-4 text-base font-semibold">Repository GitHub</h2>
          <div className="flex flex-col gap-2">
            {REPOS.map((repo) => (
              <a
                key={repo.url}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-lg border border-[#e2e6ec] bg-white px-4 py-3 transition hover:border-[#c8cfda] hover:bg-[#f6f7f9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14181f]"
              >
                <span className="font-mono text-sm text-[#14181f]">{repo.label}</span>
                <span className="text-xs text-[#5a6472] transition group-hover:text-[#0a6b48]">Buka</span>
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-[#e2e6ec] pt-6">
          <p className="text-xs text-[#5a6472]">
            Fanra AI Portal · Status diperbarui otomatis setiap 10 detik
          </p>
        </footer>
      </div>
    </div>
  )
}
