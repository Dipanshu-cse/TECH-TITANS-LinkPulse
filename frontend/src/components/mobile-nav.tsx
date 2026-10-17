"use client"

import { useState } from "react"
import { Link2, ArrowUpRight, Menu, X } from "lucide-react"

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Bot Shield", href: "#shortener" },
  { label: "Analytics", href: "#shortener" },
]

export function MobileNav({ onGetStarted }: { onGetStarted: () => void }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-3xl">

        {/* Main bar */}
        <nav
          className="flex items-center justify-between px-5 py-3 rounded-2xl"
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(5,5,7,0.80)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset",
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div style={{
              width: 28, height: 28,
              borderRadius: 8,
              background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 700, color: "white", letterSpacing: "0.05em",
              flexShrink: 0,
            }}>
              LP
            </div>
            <span style={{
              fontSize: 13, fontWeight: 500, letterSpacing: "0.04em",
              color: "rgba(255,255,255,0.75)",
            }}>
              LinkPulse
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                style={{
                  fontSize: 12, color: "rgba(255,255,255,0.45)",
                  letterSpacing: "0.03em", textDecoration: "none",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={onGetStarted}
              className="hidden md:inline-flex items-center gap-2"
              style={{
                fontSize: 12, padding: "7px 16px", borderRadius: 100,
                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                border: "none", color: "white", cursor: "pointer",
                fontWeight: 500, letterSpacing: "0.02em",
                boxShadow: "0 4px 16px rgba(124,58,237,0.35)",
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.85")}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
            >
              Get Started <ArrowUpRight style={{ width: 12, height: 12 }} />
            </button>

            {/* Burger */}
            <button
              onClick={() => setOpen(v => !v)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg"
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.6)",
                cursor: "pointer",
                transition: "background 0.2s ease",
              }}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open
                ? <X style={{ width: 14, height: 14 }} />
                : <Menu style={{ width: 14, height: 14 }} />
              }
            </button>
          </div>
        </nav>

        {/* Mobile dropdown */}
        <div
          className="md:hidden mt-2 overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: open ? "320px" : "0px", opacity: open ? 1 : 0 }}
        >
          <div
            className="rounded-2xl px-2 py-2 flex flex-col gap-0.5"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(5,5,7,0.92)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                onClick={close}
                style={{
                  padding: "12px 16px", fontSize: 14,
                  color: "rgba(255,255,255,0.55)", borderRadius: 12,
                  textDecoration: "none", transition: "background 0.15s ease, color 0.15s ease",
                  display: "block",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)"
                  e.currentTarget.style.color = "rgba(255,255,255,0.85)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.color = "rgba(255,255,255,0.55)"
                }}
              >
                {l.label}
              </a>
            ))}
            <div className="mt-1 px-2 pb-1">
              <button
                onClick={() => { onGetStarted(); close() }}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 14,
                  background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                  border: "none", color: "white", cursor: "pointer",
                  fontSize: 13, fontWeight: 500,
                  boxShadow: "0 4px 20px rgba(124,58,237,0.3)",
                }}
              >
                Get Started Free →
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
