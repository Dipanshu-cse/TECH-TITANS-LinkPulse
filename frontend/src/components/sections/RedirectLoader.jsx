// ─── RedirectLoader.jsx ──────────────────────────────────────────────────────
// Shown when a user visits a shortened link.
// Two states:
//   1. Loading — secure redirect check spinner
//   2. Password gate — a full-screen card asking for the password

import { useState } from "react"
import { KeyRound, LockKeyhole, Sparkles, ArrowRight } from "lucide-react"
import AnimatedBackground from "../ui-custom/AnimatedBackground"
import CustomCursor from "../ui-custom/CustomCursor"

// passwordState = null  → show loading spinner
// passwordState = { onSubmit: fn, error: string } → show password gate
export default function RedirectLoader({ passwordState = null, error = "" }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <CustomCursor />
      <AnimatedBackground />

      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm">

        {/* LP logo — always shown */}
        <div className="redirect-logo">
          <span>LP</span>
        </div>

        {error ? (
          <div
            role="alert"
            className="w-full rounded-3xl p-7 text-center"
            style={{ background: "var(--modal-bg)", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>{error}</p>
            <a href="/" className="mt-5 inline-flex rounded-xl px-4 py-2 text-xs text-white" style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
              Return home
            </a>
          </div>
        ) : passwordState ? (
          /* ── Password gate ───────────────────────────────────────────────── */
          <PasswordGate onSubmit={passwordState.onSubmit} error={passwordState.error} />
        ) : (
          /* ── Loading spinner ─────────────────────────────────────────────── */
          <div
            className="flex items-center gap-3 rounded-full px-6 py-3 backdrop-blur-xl"
            style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
          >
            <Sparkles className="size-4 animate-spin text-violet-400" />
            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Checking your link...
            </span>
          </div>
        )}

      </div>
    </main>
  )
}

// ─── PasswordGate ─────────────────────────────────────────────────────────────
// Full-screen password card shown when a link is password protected.
function PasswordGate({ onSubmit, error }) {
  const [value, setValue] = useState("")

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(value)
  }

  return (
    <div
      className="w-full rounded-3xl p-7"
      style={{
        background: "var(--modal-bg)",
        border: "1px solid var(--border-strong)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.4), 0 0 80px rgba(139,92,246,0.08)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-2xl shrink-0"
          style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.22)" }}
        >
          <LockKeyhole className="size-4 text-violet-400" />
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            Password protected
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Enter the password to access this link
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="relative">
          <KeyRound
            className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4"
            style={{ color: "var(--text-faint)" }}
          />
          <input
            type="password"
            autoFocus
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Enter password"
            className="w-full h-12 rounded-2xl border pl-10 pr-4 text-sm outline-none transition"
            style={{
              borderColor: error ? "rgba(239,68,68,0.5)" : "var(--input-border)",
              background: "var(--input-bg)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="flex items-center gap-1.5 text-xs text-rose-400 pl-1">
            <span className="size-1.5 rounded-full bg-rose-400 shrink-0" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!value.trim()}
          className="flex items-center justify-center gap-2 h-12 rounded-2xl text-sm font-medium text-white transition"
          style={{
            background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
            opacity: value.trim() ? 1 : 0.5,
            cursor: value.trim() ? "pointer" : "not-allowed",
            boxShadow: "0 8px 32px rgba(124,58,237,0.35)",
          }}
        >
          Unlock Link <ArrowRight className="size-4" />
        </button>
      </form>
    </div>
  )
}
