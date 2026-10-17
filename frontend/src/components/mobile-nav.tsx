"use client"

import { useState } from "react"
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react"
import darkThemeLogo from "../assets/linkpulse-logo.png"
import lightThemeLogo from "../assets/linkpulse-logo-light.png"

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
  { label: "Bot Shield", href: "#shortener" },
  { label: "Analytics", href: "#shortener" },
]

export function MobileNav({
  onGetStarted,
  theme,
  onToggleTheme,
}: {
  onGetStarted: () => void
  theme: "dark" | "light"
  onToggleTheme: () => void
}) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const isDark = theme === "dark"

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-3xl">

        {/* Main bar */}
        <nav
          className="flex items-center justify-between px-5 py-3 rounded-2xl"
          style={{
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(37,34,55,0.12)"}`,
            background: isDark ? "rgba(5,5,7,0.80)" : "rgba(250,249,255,0.88)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: isDark
              ? "0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset"
              : "0 8px 32px rgba(39,32,72,0.12), 0 1px 0 rgba(255,255,255,0.8) inset",
          }}
        >
          {/* Logo */}
          <div className="brand-logo">
            <img src={theme === "dark" ? darkThemeLogo : lightThemeLogo} alt="LinkPulse" />
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                style={{
                  fontSize: 12, color: isDark ? "rgba(255,255,255,0.45)" : "#625f72",
                  letterSpacing: "0.03em", textDecoration: "none",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.85)" : "#29263a")}
                onMouseLeave={e => (e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.45)" : "#625f72")}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleTheme}
              className="theme-toggle"
              aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
              title={`Switch to ${isDark ? "light" : "dark"} theme`}
            >
              {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </button>
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
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(37,34,55,0.12)"}`,
                background: isDark ? "rgba(255,255,255,0.04)" : "rgba(37,34,55,0.04)",
                color: isDark ? "rgba(255,255,255,0.6)" : "#625f72",
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
              border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(37,34,55,0.12)"}`,
              background: isDark ? "rgba(5,5,7,0.92)" : "rgba(250,249,255,0.96)",
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
                  color: isDark ? "rgba(255,255,255,0.55)" : "#625f72", borderRadius: 12,
                  textDecoration: "none", transition: "background 0.15s ease, color 0.15s ease",
                  display: "block",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(37,34,55,0.05)"
                  e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.85)" : "#29263a"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.55)" : "#625f72"
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
