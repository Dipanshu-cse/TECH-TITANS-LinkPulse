// ─── ShortenerSection.jsx ────────────────────────────────────────────────────
// Ye page ka sabse important section hai — yahan user apna link shorten karta hai.
// Is section mein teen bade parts hain:
//
//  1. SHORTENER FORM     — URL input, custom alias, generate button, password toggle
//  2. STATS CARDS        — Total Clicks, Active Links, Shield Status dikhata hai
//  3. LINKS TABLE        — User ke saare shortened links ek table mein
//
// Props:
//   sectionRef    — is section ka DOM reference (scroll karne ke liye App.jsx mein chahiye)
//   tableRef      — table ka DOM reference (modal ke "View in table" button ke liye)
//   links         — user ke saare links ka array (Supabase se)
//   loading       — kya links ab bhi load ho rahe hain
//   totalClicks   — saare links ka combined click count
//   activeLinksCount — active (disabled nahi) links ki ginti
//   longUrl, setLongUrl     — long URL field ki state
//   alias, setAlias         — custom alias field ki state
//   aliasError, setAliasError — alias mein koi error aayi to message
//   passwordProtected, setPasswordProtected — checkbox ki state
//   password, setPassword   — password field ki state
//   generating    — kya form submit ho raha hai (button disable karne ke liye)
//   copied        — kaunsa link copy hua hai (check icon dikhane ke liye)
//   onSubmit      — form submit handle karne ka function
//   onCopy        — link copy karne ka function

import { ArrowUpRight, Check, Copy, KeyRound, Link2, LockKeyhole, ShieldCheck } from "lucide-react"
import GlassCard from "../ui-custom/GlassCard"
import AnimatedCounter from "../ui-custom/AnimatedCounter"

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
  generating,
  copied,
  onSubmit,
  onCopy,
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
        {/* GlassCard glow prop se ek violet glow aata hai form ke around */}
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

          {/* ── Password Protection Toggle ─────────────────────────────────── */}
          <div className="mt-6 flex flex-wrap items-center gap-5 pt-5 border-t border-white/[0.06]">

            {/* Checkbox — password protect karna hai kya */}
            <label htmlFor="password-protected" className="inline-flex cursor-pointer items-center gap-3 text-sm text-white/50">
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
              <LockKeyhole className="size-4 text-white/30" />
              Password protect this link
            </label>

            {/* Password input — sirf tab dikhta hai jab checkbox checked ho */}
            {passwordProtected && (
              <div className="relative flex items-center">
                <KeyRound className="absolute left-3.5 size-3.5 text-white/30" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Set secret password"
                  className="h-10 rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 text-xs text-white outline-none transition placeholder:text-white/25 focus:border-violet-500/50 focus:bg-white/[0.08]"
                />
              </div>
            )}
          </div>
        </GlassCard>

        {/* ── Stats Cards Row ─────────────────────────────────────────────── */}
        {/* Teen cards: Total Clicks, Active Links, Shield Status */}
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

          {/* Shield status card — thoda alag hai, hardcoded "Active" text hai */}
          <GlassCard className="p-6 stats-card">
            <div className="stats-icon-wrap bg-violet-500/10">
              <ShieldCheck className="size-5 text-violet-400" />
            </div>
            <div className="mt-4 text-3xl font-light tracking-tight text-emerald-400">Active</div>
            <div className="mt-1 text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Shield Status
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400/60">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              GhostClick™ engine running
            </div>
          </GlassCard>
        </div>

        {/* ── Links Table ─────────────────────────────────────────────────── */}
        {/* User ke saare shortened links yahan table mein dikhte hain */}
        <div ref={tableRef}>
          <LinksTable
            links={links}
            loading={loading}
            copied={copied}
            onCopy={onCopy}
          />
        </div>
      </div>
    </section>
  )
}

// ─── ShortenerForm — URL Input + Alias + Generate Button ─────────────────────
// Ye form ke andar wala hissa hai — alag component taaki code readable rahe.
function ShortenerForm({ longUrl, setLongUrl, alias, setAlias, aliasError, setAliasError, generating, onSubmit }) {
  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-6 lg:grid-cols-[1fr_0.8fr_auto] lg:items-end"
    >
      {/* Long URL input */}
      <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.16em] text-white/40">
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

      {/* Custom Alias input with "go.lp/" prefix */}
      <div className="flex flex-col justify-end">
        <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.16em] text-white/40">
          <div className="flex items-center justify-between">
            <span>Custom Alias</span>
            <span className="normal-case tracking-normal text-white/25">optional</span>
          </div>
          {/* form-input-prefix = "go.lp/" prefix ke saath ek custom input box */}
          <div className={`form-input-prefix ${aliasError ? "border-rose-500/60" : ""}`}>
            <span className="shrink-0 text-white/25 text-xs">go.lp/</span>
            <input
              value={alias}
              onChange={e => { setAlias(e.target.value); if (aliasError) setAliasError("") }}
              placeholder="your-alias"
              className="min-w-0 flex-1 bg-transparent pl-1 outline-none placeholder:text-white/20 text-white text-sm"
            />
          </div>
        </label>

        {/* Alias error message — sirf tab dikhta hai jab alias already taken ho */}
        {aliasError && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-400">
            <span className="size-1.5 shrink-0 rounded-full bg-rose-400" />
            {aliasError}
          </div>
        )}
      </div>

      {/* Generate button — form submit karta hai */}
      <button type="submit" disabled={generating} className="cta-generate">
        {generating ? (
          // Generating state mein spinner dikhao
          <><span className="generate-spinner" /> Generating...</>
        ) : (
          <>Generate <ArrowUpRight className="size-4" /></>
        )}
      </button>
    </form>
  )
}

// ─── StatsCard — Ek stats card component ──────────────────────────────────────
// Teen stats cards mein se do is component se bante hain (Click + Active Links).
// Props: icon, iconBg, value, label, sub
function StatsCard({ icon, iconBg, value, label, sub }) {
  return (
    <GlassCard className="p-6 stats-card">
      <div className={`stats-icon-wrap ${iconBg}`}>
        {icon}
      </div>
      <div className="mt-4 text-3xl font-light tracking-tight tabular-nums">
        {value}
      </div>
      <div className="mt-1 text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        {label}
      </div>
      <div className="mt-2 text-[11px]" style={{ color: "var(--text-faint)" }}>
        {sub}
      </div>
    </GlassCard>
  )
}

// ─── LinksTable — User ke saare shortened links ───────────────────────────────
// Ye table user ke links dikhata hai: short link, original URL, status, clicks.
// Loading state mein spinner dikhata hai, empty state mein placeholder.
function LinksTable({ links, loading, copied, onCopy }) {
  return (
    <GlassCard className="mt-4 overflow-hidden">
      {/* Table header row */}
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

        {/* "Live" badge — green pulsing dot ke saath */}
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest text-emerald-400/70">Live</span>
        </div>
      </div>

      {/* Scrollable table area */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead
            className="text-[10px] uppercase tracking-[0.16em]"
            style={{ borderBottom: "1px solid var(--border)", color: "var(--thead-text)" }}
          >
            <tr>
              <th className="px-6 py-4 font-normal md:px-8">Short Link</th>
              <th className="px-4 py-4 font-normal">Original URL</th>
              <th className="px-4 py-4 font-normal">Status</th>
              <th className="px-6 py-4 font-normal md:px-8">Clicks</th>
            </tr>
          </thead>
          <tbody>
            {/* ── Loading state ──────────────────────────────────────────── */}
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                  <div className="flex items-center justify-center gap-2">
                    <span className="size-4 rounded-full border-2 border-violet-500/40 border-t-violet-500 animate-spin" />
                    Connecting to database...
                  </div>
                </td>
              </tr>

            ) : links.length === 0 ? (
              /* ── Empty state ───────────────────────────────────────────── */
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Link2 className="size-8 text-white/10" strokeWidth={1} />
                    <p className="text-xs text-white/30">No links yet. Create your first link above.</p>
                  </div>
                </td>
              </tr>

            ) : (
              /* ── Links rows ────────────────────────────────────────────── */
              links.map(link => {
                // directUrl = actual working URL (localhost ya production domain)
                const directUrl = `${window.location.origin}/${link.short_code}`
                // displayBrand = branded display ke liye (go.lp/... format)
                const displayBrand = `go.lp/${link.short_code}`

                return (
                  <tr
                    key={link.id || link.short_code}
                    className="table-row-hover border-b border-white/[0.04] last:border-0"
                  >
                    {/* Short link + copy button */}
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
                        {/* Copy button — click pe link clipboard mein jaata hai */}
                        <button
                          type="button"
                          onClick={() => onCopy(directUrl)}
                          className="inline-flex items-center p-1 text-white/25 hover:text-white/70 transition-colors"
                          title="Copy link"
                        >
                          {copied === directUrl
                            ? <Check className="size-3 text-emerald-400" />
                            : <Copy className="size-3" />}
                        </button>
                      </div>
                    </td>

                    {/* Original URL — truncated agar bahut lamba ho */}
                    <td className="max-w-[240px] truncate px-4 py-5 text-xs text-white/30">
                      {link.original_url}
                    </td>

                    {/* Status badge — Active / Protected / Disabled */}
                    <td className="px-4 py-5">
                      <span className={`status-badge ${link.is_disabled ? "status-disabled" : link.password_hash ? "status-protected" : "status-active"}`}>
                        <span className={`size-1.5 rounded-full ${link.is_disabled ? "bg-amber-400" : link.password_hash ? "bg-violet-400" : "bg-emerald-400"}`} />
                        {link.is_disabled ? "Disabled" : link.password_hash ? "Protected" : "Active"}
                      </span>
                    </td>

                    {/* Clicks — number + progress bar */}
                    <td className="px-6 py-5 md:px-8">
                      <div className="flex items-center gap-3">
                        {/* Progress bar — max 100 clicks pe full bhar jaati hai */}
                        <div className="h-1 w-20 overflow-hidden rounded-full bg-white/[0.07]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                            style={{ width: `${Math.min((link.clicks_count || 0), 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/40 tabular-nums">{link.clicks_count || 0}</span>
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
