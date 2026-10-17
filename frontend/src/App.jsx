"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowDown, ArrowUpRight, Check, Copy, ExternalLink, KeyRound, Link2, LockKeyhole, ShieldCheck, Sparkles, X } from "lucide-react"
import { IntroAnimation, HERO_REVEAL_MS } from "./components/intro-animation"
import { MobileNav } from "./components/mobile-nav"
import { supabase } from "./supabase"

function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-[26px] border border-white/60 bg-white/[0.46] shadow-[0_24px_80px_rgba(41,38,32,0.08)] backdrop-blur-2xl ${className}`}
    >
      {children}
    </div>
  )
}

export default function LinkPulsePage() {
  const [heroReady, setHeroReady] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [longUrl, setLongUrl] = useState("")
  const [alias, setAlias] = useState("")
  const [aliasError, setAliasError] = useState("")
  const [passwordProtected, setPasswordProtected] = useState(false)
  const [password, setPassword] = useState("")
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [redirecting, setRedirecting] = useState(false)
  const [copied, setCopied] = useState(null)
  const [createdModal, setCreatedModal] = useState(null)

  const linkPulseRef = useRef(null)
  const tableRef = useRef(null)

  const visitorId = useMemo(() => {
    let id = localStorage.getItem("linkpulse_visitor_id")
    if (!id) {
      id = "usr_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
      localStorage.setItem("linkpulse_visitor_id", id)
    }
    return id
  }, [])

  const handleIntroDone = useCallback(() => setHeroReady(true), [])

  useEffect(() => {
    const timer = setTimeout(() => setVideoReady(true), HERO_REVEAL_MS)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const slug = window.location.pathname.replace(/^\/+/, "").trim()
    if (!slug) return

    setRedirecting(true)

    async function processRedirect() {
      const { data, error } = await supabase
        .from("links")
        .select("id, original_url, clicks_count, is_disabled, password_hash")
        .eq("short_code", slug)
        .single()

      if (error || !data) {
        alert("Link not found or expired.")
        window.location.href = "/"
        return
      }

      if (data.is_disabled) {
        alert("This link has been disabled.")
        window.location.href = "/"
        return
      }

      const hasPassword = Boolean(data.password_hash && data.password_hash.trim().length > 0)

      if (hasPassword) {
        const enteredPassword = window.prompt("This link is password protected. Enter the access password:")
        if (!enteredPassword || enteredPassword.trim() !== data.password_hash.trim()) {
          alert("Incorrect password or access cancelled.")
          window.location.href = "/"
          return
        }
      }

      await supabase
        .from("links")
        .update({ clicks_count: (data.clicks_count || 0) + 1 })
        .eq("id", data.id)

      const destination = data.original_url.startsWith("http://") || data.original_url.startsWith("https://")
        ? data.original_url
        : `https://${data.original_url}`

      window.location.href = destination
    }

    processRedirect()
  }, [])

  const fetchLinks = useCallback(async () => {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("visitor_id", visitorId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching links:", error.message)
    } else if (data) {
      setLinks(data)
    }
    setLoading(false)
  }, [visitorId])

  useEffect(() => {
    fetchLinks()
  }, [fetchLinks])

  const totalClicks = useMemo(() => {
    return links.reduce((sum, link) => sum + (Number(link.clicks_count) || 0), 0)
  }, [links])

  const activeLinksCount = useMemo(() => {
    return links.filter((link) => !link.is_disabled).length
  }, [links])

  const scrollToShortener = () => linkPulseRef.current?.scrollIntoView({ behavior: "smooth" })

  const handleGenerate = async (event) => {
    event.preventDefault()
    setAliasError("")
    if (!longUrl.trim()) return

    if (passwordProtected && !password.trim()) {
      alert("Please enter a protection password or uncheck the password option.")
      return
    }

    const slug = alias.trim()
      ? alias.trim().replace(/\s+/g, "").toLowerCase()
      : Math.random().toString(36).substring(2, 8)

    const isProtected = Boolean(passwordProtected && password.trim().length > 0)

    const newRecord = {
      original_url: longUrl.trim(),
      short_code: slug,
      clicks_count: 0,
      is_disabled: false,
      visitor_id: visitorId,
      password_hash: isProtected ? password.trim() : null
    }

    const { data, error } = await supabase
      .from("links")
      .insert([newRecord])
      .select()

    if (error) {
      if (error.code === "23505") {
        setAliasError(`Alias "${slug}" is already taken. Try another alias.`)
      } else {
        setAliasError("Unable to save link right now. Please try again.")
        console.error("Insert error:", error)
      }
      return
    }

    if (data && data.length > 0) {
      const generatedLink = data[0]
      setLinks((prev) => [generatedLink, ...prev])
      setLongUrl("")
      setAlias("")
      setPassword("")
      setPasswordProtected(false)

      setCreatedModal({
        workingUrl: `${window.location.origin}/${generatedLink.short_code}`,
        displayUrl: `go.linkpulse.io/${generatedLink.short_code}`,
        originalUrl: generatedLink.original_url,
        isProtected: Boolean(generatedLink.password_hash)
      })
    }
  }

  const copyLink = async (textToCopy) => {
    await navigator.clipboard?.writeText(textToCopy)
    setCopied(textToCopy)
    setTimeout(() => setCopied(null), 1600)
  }

  if (redirecting) {
    return (
      <main className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-center p-6 text-[#111]">
        <div className="flex items-center gap-3 rounded-full border border-black/10 bg-white/70 px-6 py-3 shadow-lg backdrop-blur-xl">
          <Sparkles className="size-4 animate-spin text-black" />
          <span className="text-sm font-medium">Routing via GhostClick™ Bot Shield...</span>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F5F4F0] text-[#111] font-sans antialiased">
      <IntroAnimation onDone={handleIntroDone} />
      <MobileNav onGetStarted={scrollToShortener} />

      <section className="relative h-screen overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 z-0 h-full w-full object-cover"
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/agentic-hero-9yW3wnTNMfn2U6lsVhTTZSJFEvAoSj.mp4"
          style={{ transform: videoReady ? "scale(1.05)" : "scale(0.85)", transition: "transform 2s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
        <div className="absolute inset-x-0 bottom-0 z-10 h-[65%] pointer-events-none" style={{ background: "linear-gradient(to top, #F5F4F0 0%, #F5F4F0 18%, rgba(245,244,240,0.85) 35%, rgba(245,244,240,0.5) 55%, rgba(245,244,240,0.15) 75%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 z-10 h-[20%] pointer-events-none" style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", maskImage: "linear-gradient(to top, black 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 z-10 h-[38%] pointer-events-none" style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", maskImage: "linear-gradient(to top, black 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 z-10 h-[55%] pointer-events-none" style={{ backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)", maskImage: "linear-gradient(to top, black 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)" }} />

        <div className="absolute inset-x-0 bottom-0 z-30 flex max-w-4xl flex-col px-6 pb-12 md:px-12">
          <h1
            className="mb-10 text-6xl font-light leading-[1.0] tracking-tight text-[#111] sm:text-7xl md:text-8xl"
            style={{ fontFamily: '"IBM Plex Sans", sans-serif', opacity: heroReady ? 1 : 0, filter: heroReady ? "blur(0px)" : "blur(24px)", transform: heroReady ? "translateY(0px)" : "translateY(32px)", transition: "opacity 1s cubic-bezier(0.16,1,0.3,1), filter 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1)" }}
          >
            Next Generation<br />URL Management.
          </h1>
          <p className="mb-10 max-w-3xl text-base leading-relaxed text-black/55 sm:text-lg" style={{ opacity: heroReady ? 1 : 0, transform: heroReady ? "translateY(0)" : "translateY(20px)", transition: "opacity .8s ease 80ms, transform .8s ease 80ms" }}>
            LinkPulse goes beyond simple shortening. Protect your campaigns with our GhostClick™ Bot Shield, analyze real time human traffic, and manage links seamlessly.
          </p>
          <div className="flex flex-wrap items-center gap-8 sm:gap-12">
            {["GHOSTCLICK™ PROTECTION", "REAL TIME ANALYTICS", "SMART ROUTING"].map((pillar, index) => (
              <div key={pillar} style={{ opacity: heroReady ? 1 : 0, transform: heroReady ? "translateY(0)" : "translateY(20px)", transition: `opacity .8s ease ${120 + index * 80}ms, transform .8s ease ${120 + index * 80}ms` }}>
                <div className="max-w-[150px] text-xs uppercase tracking-widest text-black/40" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>{pillar}</div>
              </div>
            ))}
            <button onClick={scrollToShortener} className="group ml-auto inline-flex items-center gap-3 rounded-full border border-black/10 bg-white/55 px-5 py-3 text-sm text-black/70 backdrop-blur-md transition hover:bg-white/80 hover:text-black">
              Shorten a Link <ArrowDown className="transition-transform group-hover:translate-y-1" />
            </button>
          </div>
        </div>
      </section>

      <section ref={linkPulseRef} id="shortener" className="px-6 py-28 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-black/[0.04] px-3 py-1 text-[11px] tracking-[0.2em] text-black/40">
                <Sparkles className="size-3.5" /> LINKPULSE
              </div>
              <h2 className="text-4xl font-light tracking-tight md:text-6xl">Create your secure LinkPulse URL.</h2>
            </div>
            <Link2 className="hidden size-12 text-black/20 md:block" strokeWidth={1} />
          </div>

          <GlassCard className="p-6 md:p-10">
            <form onSubmit={handleGenerate} className="grid gap-8 lg:grid-cols-[1fr_0.8fr_auto] lg:items-end">
              <label className="flex flex-col gap-3 text-xs uppercase tracking-[0.16em] text-black/45">
                Long URL
                <input 
                  required 
                  type="url" 
                  value={longUrl} 
                  onChange={(event) => setLongUrl(event.target.value)} 
                  placeholder="https://your-long-link.com/..." 
                  className="h-14 rounded-2xl border border-black/10 bg-white/55 px-4 text-sm normal-case tracking-normal text-black outline-none transition placeholder:text-black/25 focus:border-black/30 focus:bg-white/80" 
                />
              </label>

              <div className="flex flex-col justify-end">
                <label className="flex flex-col gap-3 text-xs uppercase tracking-[0.16em] text-black/45">
                  <div className="flex items-center justify-between">
                    <span>Custom Alias</span>
                    <span className="normal-case tracking-normal text-black/25">optional</span>
                  </div>
                  <div className={`flex h-14 items-center rounded-2xl border bg-white/55 px-4 text-sm text-black/50 transition focus-within:bg-white/80 ${aliasError ? "border-rose-400 focus-within:border-rose-500" : "border-black/10 focus-within:border-black/30"}`}>
                    <span className="shrink-0 text-black/30">go.linkpulse.io/</span>
                    <input 
                      value={alias} 
                      onChange={(event) => {
                        setAlias(event.target.value)
                        if (aliasError) setAliasError("")
                      }} 
                      placeholder="your-alias" 
                      className="min-w-0 flex-1 bg-transparent pl-1 outline-none placeholder:text-black/25 text-black" 
                    />
                  </div>
                </label>
                {aliasError && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 font-normal">
                    <span className="size-1.5 shrink-0 rounded-full bg-rose-600" />
                    <span>{aliasError}</span>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#111] px-7 text-sm tracking-wide text-white shadow-[0_12px_30px_rgba(17,17,17,0.22)] transition hover:-translate-y-0.5 hover:bg-black/80"
              >
                Generate <ArrowUpRight className="size-4" />
              </button>
            </form>

            <div className="mt-7 flex flex-wrap items-center gap-6">
              <label className="inline-flex cursor-pointer items-center gap-3 text-sm text-black/55">
                <input 
                  type="checkbox" 
                  checked={passwordProtected} 
                  onChange={(event) => setPasswordProtected(event.target.checked)} 
                  className="peer sr-only" 
                />
                <span className="flex size-5 items-center justify-center rounded-md border border-black/15 bg-white/60 transition peer-checked:border-black peer-checked:bg-black peer-checked:text-white">
                  <Check className="hidden size-3 peer-checked:block" />
                </span>
                <LockKeyhole className="size-4 text-black/35" /> Password protect this link
              </label>

              {passwordProtected && (
                <div className="relative flex items-center">
                  <KeyRound className="absolute left-3.5 size-3.5 text-black/40" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Set secret password"
                    className="h-10 rounded-xl border border-black/15 bg-white/70 pl-9 pr-4 text-xs text-black outline-none transition placeholder:text-black/30 focus:border-black/40 focus:bg-white"
                  />
                </div>
              )}
            </div>
          </GlassCard>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <GlassCard className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.16em] text-black/40">Verified Clicks</span>
                <ShieldCheck className="size-4 text-black/25" />
              </div>
              <div className="text-3xl font-light tracking-tight">{totalClicks}</div>
              <div className="mt-2 text-xs text-black/35">Live tracked on your links</div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.16em] text-black/40">Active Links</span>
                <Link2 className="size-4 text-black/25" />
              </div>
              <div className="text-3xl font-light tracking-tight">{activeLinksCount}</div>
              <div className="mt-2 text-xs text-black/35">Personal workspace links</div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.16em] text-black/40">Shield Status</span>
                <ShieldCheck className="size-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-light tracking-tight text-emerald-600">Active</div>
              <div className="mt-2 text-xs text-black/35">GhostClick™ engine active</div>
            </GlassCard>
          </div>

          <div ref={tableRef}>
            <GlassCard className="mt-4 overflow-hidden">
              <div className="flex items-center justify-between border-b border-black/[0.07] px-6 py-5 md:px-8">
                <div>
                  <h3 className="text-lg font-light">Recently shortened links</h3>
                  <p className="mt-1 text-xs text-black/35">Your private workspace activity, live from Supabase.</p>
                </div>
                <div className="text-xs uppercase tracking-[0.16em] text-black/35">Live data</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-black/[0.06] text-[10px] uppercase tracking-[0.16em] text-black/35">
                    <tr>
                      <th className="px-6 py-4 font-normal md:px-8">Short Link</th>
                      <th className="px-4 py-4 font-normal">Original URL</th>
                      <th className="px-4 py-4 font-normal">Status</th>
                      <th className="px-6 py-4 font-normal md:px-8">Clicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-xs text-black/40">
                          Connecting to database...
                        </td>
                      </tr>
                    ) : links.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-xs text-black/40">
                          No links generated in your workspace yet. Create your first link above.
                        </td>
                      </tr>
                    ) : (
                      links.map((link) => {
                        const directUrl = `${window.location.origin}/${link.short_code}`
                        const displayBrand = `go.linkpulse.io/${link.short_code}`
                        return (
                          <tr key={link.id || link.short_code} className="border-b border-black/[0.05] last:border-0">
                            <td className="px-6 py-5 md:px-8">
                              <div className="inline-flex items-center gap-2">
                                <a
                                  href={directUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-mono text-xs text-black/70 hover:text-black hover:underline"
                                >
                                  {displayBrand}
                                </a>
                                <button
                                  type="button"
                                  onClick={() => copyLink(directUrl)}
                                  className="group inline-flex items-center p-1 text-black/40 hover:text-black"
                                  title="Copy runnable link"
                                >
                                  {copied === directUrl ? (
                                    <Check className="size-3 text-emerald-700" />
                                  ) : (
                                    <Copy className="size-3 opacity-60 transition group-hover:opacity-100" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="max-w-[280px] truncate px-4 py-5 text-xs text-black/40">
                              {link.original_url}
                            </td>
                            <td className="px-4 py-5">
                              <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/50 px-3 py-1 text-[11px] text-black/55">
                                <span
                                  className={`size-1.5 rounded-full ${
                                    link.is_disabled
                                      ? "bg-amber-500"
                                      : link.password_hash
                                      ? "bg-indigo-500"
                                      : "bg-emerald-500"
                                  }`}
                                />
                                {link.is_disabled ? "Disabled" : link.password_hash ? "Protected" : "Active"}
                              </span>
                            </td>
                            <td className="px-6 py-5 md:px-8">
                              <div className="flex items-center gap-3">
                                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-black/[0.08]">
                                  <div
                                    className="h-full rounded-full bg-[#111]"
                                    style={{ width: `${Math.min(link.clicks_count || 0, 100)}%` }}
                                  />
                                </div>
                                <span className="w-8 text-xs text-black/45">{link.clicks_count || 0}</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {createdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-white/70 bg-white/85 p-6 shadow-2xl backdrop-blur-xl">
            <button 
              onClick={() => setCreatedModal(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-black/40 hover:bg-black/5 hover:text-black"
            >
              <X className="size-4" />
            </button>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <Check className="size-3.5" /> Link Ready
            </div>
            <h3 className="text-xl font-light text-black">Your shortened link is live</h3>
            <p className="mt-1 truncate text-xs text-black/45">Redirects to: {createdModal.originalUrl}</p>
            {createdModal.isProtected && (
              <p className="mt-1 text-xs font-medium text-indigo-700">Passcode protection active</p>
            )}
            
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-black/10 bg-white/60 p-3">
              <span className="truncate font-mono text-xs text-black/80">{createdModal.displayUrl}</span>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={createdModal.workingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-black/10 bg-white p-2 text-black/60 hover:text-black hover:bg-black/5"
                  title="Open link"
                >
                  <ExternalLink className="size-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => copyLink(createdModal.workingUrl)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#111] px-3.5 py-2 text-xs text-white transition hover:bg-black/80"
                >
                  {copied === createdModal.workingUrl ? (
                    <>
                      <Check className="size-3.5 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  setCreatedModal(null)
                  tableRef.current?.scrollIntoView({ behavior: "smooth" })
                }}
                className="rounded-xl border border-black/10 px-4 py-2 text-xs text-black/60 hover:bg-black/5"
              >
                View in table
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}