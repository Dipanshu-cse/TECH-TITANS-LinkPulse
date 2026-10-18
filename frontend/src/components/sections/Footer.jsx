// ─── Footer.jsx ──────────────────────────────────────────────────────────────
// Page ka sabse neeche wala hissa (footer).
// Isme hai:
//   - LinkPulse ka logo (theme ke hisaab se dark ya light version)
//   - Tagline
//   - "Built by Rahul & Dipanshu" — LinkedIn links ke saath
//   - Copyright year
//
// Props:
//   theme — "dark" ya "light" (sahi logo select karne ke liye)

import darkThemeLogo from "../../assets/linkpulse-logo.png"
import lightThemeLogo from "../../assets/linkpulse-logo-light.png"

export default function Footer({ theme }) {
  return (
    <footer className="relative z-10 px-6 py-12 md:px-12 lg:px-20 border-t border-white/[0.05]">
      <div className="mx-auto max-w-6xl">

        {/* Two columns: left = logo + tagline, right = credits */}
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">

          {/* ── Left: Logo + Tagline ──────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-3">
              {/* Theme ke hisaab se sahi logo dikhao */}
              <img
                className="footer-brand-logo"
                src={theme === "dark" ? darkThemeLogo : lightThemeLogo}
                alt="LinkPulse"
              />
            </div>
            <p className="mt-2 text-xs max-w-xs" style={{ color: "var(--text-faint)" }}>
              Next-generation URL intelligence. Shorten, protect, analyze.
            </p>
          </div>

          {/* ── Right: Credits + Copyright ────────────────────────────────── */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-white/35">
              <span>Built by</span>

              {/* Rahul ka LinkedIn link */}
              <a
                href="https://www.linkedin.com/in/rahulmelkani/"
                target="_blank"
                rel="noreferrer"
                className="footer-credit-link"
              >
                Rahul
              </a>

              <span className="text-white/20">&amp;</span>

              {/* Dipanshu ka LinkedIn link */}
              <a
                href="https://www.linkedin.com/in/dipanshu-chandola-842b853b7/"
                target="_blank"
                rel="noreferrer"
                className="footer-credit-link"
              >
                Dipanshu
              </a>
            </div>

            {/* Copyright — year automatically current year hoga */}
            <p className="text-[11px]" style={{ color: "var(--text-faint)" }}>
              © {new Date().getFullYear()} LinkPulse
            </p>
          </div>

        </div>
      </div>
    </footer>
  )
}
