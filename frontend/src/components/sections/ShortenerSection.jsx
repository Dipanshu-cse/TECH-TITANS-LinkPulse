// ─── ShortenerSection.jsx ────────────────────────────────────────────────────
// Ye page ka sabse important section hai — yahan user apna link shorten karta hai.
// Is section mein teen bade parts hain:
//
//  1. SHORTENER FORM     — URL, alias, password, expiry date, click limit
//  2. STATS CARDS        — Total Clicks, Active Links, Shield Status
//  3. LINKS TABLE        — User ke saare links + analytics popover

import { createPortal } from "react-dom"
import { useEffect, useRef, useState } from "react"
import {
  ArrowUpRight, BarChart2, Calendar, Check, Copy,
  Eye, EyeOff, Hash, KeyRound, Link2, LockKeyhole,
  ShieldCheck, Smartphone, Monitor, Trash2, X,
} from "lucide-react"
import GlassCard from "../ui-custom/GlassCard"
import AnimatedCounter from "../ui-custom/AnimatedCounter"
import { supabase } from "../../supabase"

export default function ShortenerSection({
  sectionRef,
  tableRef,
  links,
  loading,
  totalClicks,
  activeLinksCount,
  longUrl, setLongUrl,
  alias, setAlias,
  aliasError, setAliasError,
  passwordProtected, setPasswordProtected,
  password, setPassword,
  expiresAt, setExpiresAt,
  clickLimit, setClickLimit,
  errorMessage,
  generating,
  copied,
  onSubmit,
  onCopy,
  onToggleDisable,
  onDelete,
}) {
  return (
    <section
      ref={sectionRef}
      id="shortener"
      className="relative z-10 px-6 py-24 md:px-12 lg:px-20"
    >
      <div className="mx-auto max-w-6xl">

        {/* ── Section Header ──────────────────────────────────────────────── */}
        <div className="mb-12 text-center">
          <div className="section-badge mx-auto mb-4">
            <Link2 className="size-3.5 text-violet-400" /> CREATE
          </div>
          <h2 className="section-title">Create your secure LinkPulse URL.</h2>
          <p className="section-sub mx-auto">Paste, customize, and launch your link in under 3 seconds.</p>
        </div>

        {/* ── Shortener Form Card ─────────────────────────────────────────── */}
        <GlassCard glow className="p-6 md:p-10">
          <ShortenerForm
            longUrl={longUrl}
            setLongUrl={setLongUrl}
            alias={alias}
            setAlias={setAlias}
            aliasError={aliasError}
            setAliasError={setAliasError}
            generating={generating}
            onSubmit={onSubmit}
          />

          {/* ── Advanced options row ───────────────────────────────────────── */}
          <div className="mt-6 pt-5 border-t border-white/[0.06] space-y-4">

            {/* Row 1: password + expiry + click limit */}
            <div className="flex flex-wrap items-start gap-x-6 gap-y-4">

              {/* Password protect checkbox */}
              <label htmlFor="password-protected" className="inline-flex cursor-pointer items-center gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
                <input
                  id="password-protected"
                  type="checkbox"
                  checked={passwordProtected}
                  onChange={e => setPasswordProtected(e.target.checked)}
                  className="sr-only"
                />
                <span
                  className={`custom-checkbox ${passwordProtected ? "custom-checkbox--checked" : ""}`}
                  aria-hidden="true"
                >
                  {passwordProtected && <Check className="size-3" />}
                </span>
                <LockKeyhole className="size-4" style={{ color: "var(--text-faint)" }} />
                Password protect
              </label>

              {/* Password input — only when checked */}
              {passwordProtected && (
                <div className="relative flex items-center">
                  <KeyRound className="absolute left-3.5 size-3.5" style={{ color: "var(--text-faint)" }} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Set secret password"
                    className="h-10 rounded-xl border pl-9 pr-4 text-xs outline-none transition"
                    style={{
                      borderColor: "var(--input-border)",
                      background: "var(--input-bg)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              )}
            </div>

            {/* Row 2: expiry + click limit inline fields */}
            <div className="flex flex-wrap gap-4">

              {/* Expiry date */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
                  <Calendar className="size-3" />
                  Expiry date
                  <span className="normal-case tracking-normal ml-1" style={{ color: "var(--text-faint)" }}>optional</span>
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={e => setExpiresAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="datetime-input h-10 rounded-xl border px-3 text-xs outline-none transition"
                  style={{
                    borderColor: "var(--input-border)",
                    background: "var(--input-bg)",
                    color: expiresAt ? "var(--text-primary)" : "var(--input-placeholder)",
                  }}
                />
              </div>

              {/* Click limit */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
                  <Hash className="size-3" />
                  Click limit
                  <span className="normal-case tracking-normal ml-1" style={{ color: "var(--text-faint)" }}>optional</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={clickLimit}
                  onChange={e => setClickLimit(e.target.value)}
                  placeholder="e.g. 100"
                  className="h-10 w-32 rounded-xl border px-3 text-xs outline-none transition"
                  style={{
                    borderColor: "var(--input-border)",
                    background: "var(--input-bg)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

            </div>
          </div>
        </GlassCard>
        {errorMessage && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
          >
            {errorMessage}
          </div>
        )}

        {/* ── Stats Cards Row ─────────────────────────────────────────────── */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <StatsCard
            icon={<ShieldCheck className="size-5 text-emerald-400" />}
            iconBg="bg-emerald-500/10"
            value={<AnimatedCounter value={totalClicks} />}
            label="Verified Clicks"
            sub="Live tracked on your links"
          />
          <StatsCard
            icon={<Link2 className="size-5 text-blue-400" />}
            iconBg="bg-blue-500/10"
            value={<AnimatedCounter value={activeLinksCount} />}
            label="Active Links"
            sub="Personal workspace"
          />
          <GlassCard className="p-6 stats-card">
            <div className="stats-icon-wrap bg-violet-500/10">
              <ShieldCheck className="size-5 text-violet-400" />
            </div>
            <div className="mt-4 text-3xl font-light tracking-tight text-emerald-400">Tracking</div>
            <div className="mt-1 text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Shield Status
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400/60">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Click tracking active
            </div>
          </GlassCard>
        </div>

        {/* ── Links Table ─────────────────────────────────────────────────── */}
        <div ref={tableRef}>
          <LinksTable
            links={links}
            loading={loading}
            copied={copied}
            onCopy={onCopy}
            onToggleDisable={onToggleDisable}
            onDelete={onDelete}
          />
        </div>
      </div>
    </section>
  )
}

// ─── ShortenerForm ─────────────────────────────────────────────────────────────
function ShortenerForm({ longUrl, setLongUrl, alias, setAlias, aliasError, setAliasError, generating, onSubmit }) {
  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-6 lg:grid-cols-[1fr_0.8fr_auto] lg:items-end"
    >
      {/* Long URL */}
      <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
        Long URL
        <input
          required
          type="url"
          value={longUrl}
          onChange={e => setLongUrl(e.target.value)}
          placeholder="https://your-very-long-link.com/path?with=params"
          className="form-input"
        />
      </label>

      {/* Custom Alias */}
      <div className="flex flex-col justify-end">
        <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
          <div className="flex items-center justify-between">
            <span>Custom Alias</span>
            <span className="normal-case tracking-normal" style={{ color: "var(--text-faint)" }}>optional</span>
          </div>
          <div className={`form-input-prefix ${aliasError ? "border-rose-500/60" : ""}`}>
            <span className="shrink-0 text-xs" style={{ color: "var(--text-faint)" }}>go.lp/</span>
            <input
              value={alias}
              onChange={e => { setAlias(e.target.value); if (aliasError) setAliasError("") }}
              placeholder="your-alias"
              className="min-w-0 flex-1 bg-transparent pl-1 outline-none text-sm"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </label>
        {aliasError && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-400">
            <span className="size-1.5 shrink-0 rounded-full bg-rose-400" />
            {aliasError}
          </div>
        )}
      </div>

      {/* Generate button */}
      <button type="submit" disabled={generating} className="cta-generate">
        {generating
          ? <><span className="generate-spinner" /> Generating...</>
          : <>Generate <ArrowUpRight className="size-4" /></>}
      </button>
    </form>
  )
}

// ─── StatsCard ─────────────────────────────────────────────────────────────────
function StatsCard({ icon, iconBg, value, label, sub }) {
  return (
    <GlassCard className="p-6 stats-card">
      <div className={`stats-icon-wrap ${iconBg}`}>{icon}</div>
      <div className="mt-4 text-3xl font-light tracking-tight tabular-nums">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{label}</div>
      <div className="mt-2 text-[11px]" style={{ color: "var(--text-faint)" }}>{sub}</div>
    </GlassCard>
  )
}

// ─── AnalyticsPopover ──────────────────────────────────────────────────────────
// Renders via React Portal into document.body so it's never clipped by
// table overflow. Position is computed from the trigger button's bounding rect.
function AnalyticsPopover({ linkId, shortCode, anchorEl, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const popRef = useRef(null)

  // Compute position from anchor button
  useEffect(() => {
    if (!anchorEl) return
    const rect = anchorEl.getBoundingClientRect()
    const popWidth = 288 // w-72
    // Try to place below-right; clamp to viewport
    let left = rect.right - popWidth
    if (left < 8) left = 8
    if (left + popWidth > window.innerWidth - 8) left = window.innerWidth - popWidth - 8
    const frame = requestAnimationFrame(() => setPos({ top: rect.bottom + 8, left }))
    return () => cancelAnimationFrame(frame)
  }, [anchorEl])

  // Fetch click data
  useEffect(() => {
    async function fetchClicks() {
      const { data: rows, error } = await supabase
        .from("clicks")
        .select("device_type, created_at")
        .eq("link_id", linkId)
        .order("created_at", { ascending: false })
        .limit(200)

      if (!error && rows) {
        const mobile = rows.filter(r => r.device_type === "mobile").length
        const desktop = rows.filter(r => r.device_type === "desktop").length
        const total = rows.length
        const days = []
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const label = d.toLocaleDateString("en", { weekday: "short" })
          const count = rows.filter(r =>
            new Date(r.created_at).toDateString() === d.toDateString()
          ).length
          days.push({ label, count })
        }
        setData({ total, mobile, desktop, days })
      }
      setLoading(false)
    }
    fetchClicks()
  }, [linkId])

  // Close on outside click or Escape
  useEffect(() => {
    function handleDown(e) {
      if (popRef.current && !popRef.current.contains(e.target) &&
          anchorEl && !anchorEl.contains(e.target)) {
        onClose()
      }
    }
    function handleKey(e) { if (e.key === "Escape") onClose() }
    document.addEventListener("mousedown", handleDown)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleDown)
      document.removeEventListener("keydown", handleKey)
    }
  }, [onClose, anchorEl])

  const maxDay = data ? Math.max(...data.days.map(d => d.count), 1) : 1

  return createPortal(
    <div
      ref={popRef}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: 288,
        zIndex: 9999,
        background: "var(--modal-bg)",
        border: "1px solid var(--border-strong)",
        borderRadius: 20,
        padding: 16,
        boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.08)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Analytics</p>
          <p className="text-[10px] font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>
            go.lp/{shortCode}
          </p>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg" style={{ color: "var(--text-muted)" }}>
          <X className="size-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 gap-2" style={{ color: "var(--text-muted)" }}>
          <span className="size-4 rounded-full border-2 border-violet-500/40 border-t-violet-500 animate-spin" />
          <span className="text-xs">Loading...</span>
        </div>
      ) : !data || data.total === 0 ? (
        <p className="text-center py-4 text-xs" style={{ color: "var(--text-faint)" }}>
          No clicks recorded yet.
        </p>
      ) : (
        <>
          {/* Device split */}
          <div className="flex gap-3 mb-4">
            {[
              { icon: <Smartphone className="size-4 text-violet-400 shrink-0" />, count: data.mobile, label: "Mobile" },
              { icon: <Monitor className="size-4 text-blue-400 shrink-0" />, count: data.desktop, label: "Desktop" },
            ].map(({ icon, count, label }) => (
              <div key={label} className="flex-1 flex items-center gap-2 rounded-xl p-3"
                style={{ background: "var(--surface)" }}>
                {icon}
                <div>
                  <p className="text-base font-light tabular-nums" style={{ color: "var(--text-primary)" }}>{count}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 7-day bar chart */}
          <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--text-faint)" }}>
            Last 7 days
          </p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 56 }}>
            {data.days.map(({ label, count }) => (
              <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" }}>
                <div style={{ flex: 1, width: "100%", borderRadius: 4, overflow: "hidden", background: "var(--surface)", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <div style={{
                    width: "100%",
                    height: `${Math.round((count / maxDay) * 100)}%`,
                    minHeight: count > 0 ? 3 : 0,
                    background: "linear-gradient(to top, #7c3aed, #3b82f6)",
                    borderRadius: 4,
                    transition: "height 0.5s ease",
                  }} />
                </div>
                <span style={{ fontSize: 9, color: "var(--text-faint)" }}>{label}</span>
              </div>
            ))}
          </div>

          <p className="mt-3 text-center text-[10px]" style={{ color: "var(--text-muted)" }}>
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>{data.total}</span>
            {" "}total click{data.total !== 1 ? "s" : ""}
          </p>
        </>
      )}
    </div>,
    document.body
  )
}

// ─── LinksTable ─────────────────────────────────────────────────────────────────
function LinksTable({ links, loading, copied, onCopy, onToggleDisable, onDelete }) {
  // openPopover = { id, anchorEl } of the open analytics popover, or null
  const [openPopover, setOpenPopover] = useState(null)

  return (
    <GlassCard className="mt-4 overflow-hidden">
      {/* Table header */}
      <div
        className="flex items-center justify-between px-6 py-5 md:px-8"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div>
          <h3 className="text-base font-medium" style={{ color: "var(--text-primary)" }}>
            Recently shortened links
          </h3>
          <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
            Your private workspace activity, live from Supabase.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest text-emerald-400/70">Live</span>
        </div>
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead
            className="text-[10px] uppercase tracking-[0.16em]"
            style={{ borderBottom: "1px solid var(--border)", color: "var(--thead-text)" }}
          >
            <tr>
              <th className="px-6 py-4 font-normal md:px-8">Short Link</th>
              <th className="px-4 py-4 font-normal">Original URL</th>
              <th className="px-4 py-4 font-normal">Status</th>
              <th className="px-4 py-4 font-normal">Clicks</th>
              <th className="px-6 py-4 font-normal md:px-8">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Loading */}
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                  <div className="flex items-center justify-center gap-2">
                    <span className="size-4 rounded-full border-2 border-violet-500/40 border-t-violet-500 animate-spin" />
                    Connecting to database...
                  </div>
                </td>
              </tr>

            ) : links.length === 0 ? (
              /* Empty */
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Link2 className="size-8 text-white/10" strokeWidth={1} />
                    <p className="text-xs" style={{ color: "var(--text-faint)" }}>No links yet. Create your first link above.</p>
                  </div>
                </td>
              </tr>

            ) : (
              links.map(link => {
                const directUrl = `${window.location.origin}/${link.short_code}`
                const displayBrand = `go.lp/${link.short_code}`
                const isExpired = link.expires_at && new Date(link.expires_at) < new Date()
                const isLimitHit = link.click_limit !== null && link.click_limit !== undefined
                  && (link.clicks_count || 0) >= link.click_limit

                // Effective status: disabled > expired > limit > protected > active
                let badgeClass = "status-active"
                let badgeLabel = "Active"
                let badgeDot = "bg-emerald-400"
                if (link.is_disabled) {
                  badgeClass = "status-disabled"; badgeLabel = "Disabled"; badgeDot = "bg-amber-400"
                } else if (isExpired) {
                  badgeClass = "status-disabled"; badgeLabel = "Expired"; badgeDot = "bg-amber-400"
                } else if (isLimitHit) {
                  badgeClass = "status-disabled"; badgeLabel = "Limit hit"; badgeDot = "bg-amber-400"
                } else if (link.password_hash) {
                  badgeClass = "status-protected"; badgeLabel = "Protected"; badgeDot = "bg-violet-400"
                }

                return (
                  <tr
                    key={link.id || link.short_code}
                    className="table-row-hover border-b border-white/[0.04] last:border-0"
                  >
                    {/* Short link + copy */}
                    <td className="px-6 py-5 md:px-8">
                      <div className="inline-flex items-center gap-2">
                        <a
                          href={directUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-violet-400 hover:text-violet-300 hover:underline transition-colors"
                        >
                          {displayBrand}
                        </a>
                        <button
                          type="button"
                          onClick={() => onCopy(directUrl)}
                          className="inline-flex items-center p-1 transition-colors"
                          style={{ color: "var(--text-faint)" }}
                          title="Copy link"
                        >
                          {copied === directUrl
                            ? <Check className="size-3 text-emerald-400" />
                            : <Copy className="size-3" />}
                        </button>
                      </div>
                      {/* Expiry hint */}
                      {link.expires_at && !isExpired && (
                        <p className="mt-0.5 text-[10px] font-mono" style={{ color: "var(--text-faint)" }}>
                          Expires {new Date(link.expires_at).toLocaleDateString()}
                        </p>
                      )}
                      {/* Click limit hint */}
                      {link.click_limit && !isLimitHit && (
                        <p className="mt-0.5 text-[10px] font-mono" style={{ color: "var(--text-faint)" }}>
                          {link.clicks_count || 0}/{link.click_limit} clicks
                        </p>
                      )}
                    </td>

                    {/* Original URL */}
                    <td className="max-w-[200px] truncate px-4 py-5 text-xs" style={{ color: "var(--text-muted)" }}>
                      {link.original_url}
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-5">
                      <span className={`status-badge ${badgeClass}`}>
                        <span className={`size-1.5 rounded-full ${badgeDot}`} />
                        {badgeLabel}
                      </span>
                    </td>

                    {/* Clicks */}
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-1 w-16 overflow-hidden rounded-full bg-white/[0.07]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                            style={{
                              width: link.click_limit
                                ? `${Math.min(((link.clicks_count || 0) / link.click_limit) * 100, 100)}%`
                                : `${Math.min((link.clicks_count || 0), 100)}%`
                            }}
                          />
                        </div>
                        <span className="text-xs tabular-nums" style={{ color: "var(--text-muted)" }}>
                          {link.clicks_count || 0}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5 md:px-8">
                      <div className="relative flex items-center gap-1">

                        {/* Analytics popover button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            const isOpen = openPopover?.id === link.id
                            setOpenPopover(isOpen ? null : { id: link.id, anchorEl: e.currentTarget })
                          }}
                          className="inline-flex items-center p-1.5 rounded-lg transition-colors"
                          style={{ color: openPopover?.id === link.id ? "#8b5cf6" : "var(--text-faint)" }}
                          title="View analytics"
                        >
                          <BarChart2 className="size-3.5" />
                        </button>

                        {/* Toggle disable */}
                        <button
                          type="button"
                          onClick={() => onToggleDisable(link.id, link.is_disabled)}
                          className="inline-flex items-center p-1.5 rounded-lg transition-colors"
                          style={{ color: "var(--text-faint)" }}
                          title={link.is_disabled ? "Enable link" : "Disable link"}
                        >
                          {link.is_disabled
                            ? <Eye className="size-3.5 text-emerald-400" />
                            : <EyeOff className="size-3.5" />}
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete go.lp/${link.short_code}? This cannot be undone.`)) {
                              onDelete(link.id)
                            }
                          }}
                          className="inline-flex items-center p-1.5 rounded-lg transition-colors hover:text-rose-400"
                          style={{ color: "var(--text-faint)" }}
                          title="Delete link"
                        >
                          <Trash2 className="size-3.5" />
                        </button>

                        {/* Analytics popover — rendered via portal, never clips */}
                        {openPopover?.id === link.id && (
                          <AnalyticsPopover
                            linkId={link.id}
                            shortCode={link.short_code}
                            anchorEl={openPopover.anchorEl}
                            onClose={() => setOpenPopover(null)}
                          />
                        )}
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
  )
}
