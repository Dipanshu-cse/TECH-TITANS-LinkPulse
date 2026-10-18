// ─── HowItWorksSection.jsx ───────────────────────────────────────────────────
// Ye section "How It Works" dikhata hai — 3 simple steps mein.
// Ek vertical connector line hai jo steps ko visually join karti hai (desktop pe).
// STEPS array mein step number, title, aur description hai.

import { MousePointerClick } from "lucide-react"

// ── Steps Data Array ──────────────────────────────────────────────────────────
// Nayi step add karni ho to yahan object add karo.
const STEPS = [
  {
    num: "01",
    title: "Paste your URL",
    desc: "Drop any long URL into the input field. We accept any valid web address.",
  },
  {
    num: "02",
    title: "Customize & secure",
    desc: "Set a custom alias, add password protection, configure expiry rules.",
  },
  {
    num: "03",
    title: "Go live instantly",
    desc: "Your branded short link is live in milliseconds. Share anywhere.",
  },
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative z-10 px-6 py-24 md:px-12 lg:px-20">
      <div className="mx-auto max-w-4xl">

        {/* ── Section Header ────────────────────────────────────────────────── */}
        <div className="mb-16 text-center">
          <div className="section-badge mx-auto mb-4">
            <MousePointerClick className="size-3.5 text-violet-400" /> HOW IT WORKS
          </div>
          <h2 className="section-title">
            From URL to insight<br />
            <span className="gradient-text">in 3 steps.</span>
          </h2>
        </div>

        {/* ── Steps List ────────────────────────────────────────────────────── */}
        <div className="relative">
          {/* Vertical connector line — steps ke left side pe, sirf desktop pe visible */}
          <div className="absolute left-[28px] top-12 bottom-12 w-px bg-gradient-to-b from-violet-500/40 via-blue-500/20 to-transparent hidden md:block" />

          <div className="flex flex-col gap-10">
            {STEPS.map(step => (
              <div key={step.num} className="step-card group">

                {/* Step number badge — circular, gradient background */}
                <div className="step-num">
                  <span>{step.num}</span>
                </div>

                {/* Step title aur description */}
                <div className="ml-6 md:ml-10">
                  <h3 className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{step.desc}</p>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
