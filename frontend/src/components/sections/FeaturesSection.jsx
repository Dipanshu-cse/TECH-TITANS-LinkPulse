// ─── FeaturesSection.jsx ─────────────────────────────────────────────────────
// Ye section LinkPulse ki 6 main features ko grid mein dikhata hai.
// Har feature ek card hai jisme icon, title, aur description hai.
// FEATURES array neeche define hai — nayi feature add karni ho to wahan karo.
//
// Features list:
//   1. Click Tracking            — device and seven-day activity tracking
//   2. Click Analytics            — per-link activity summary
//   3. Password Protection       — link lock kar sakte ho
//   4. Fast Redirects            — validation before navigation
//   5. Custom Aliases            — branded short links
//   6. Expiry & Click Limits     — automatic link controls

import { BarChart3, CalendarClock, Globe, LockKeyhole, MousePointerClick, Sparkles, Zap } from "lucide-react"

// ── Features Data Array ───────────────────────────────────────────────────────
// Har object mein: icon component, title, description, gradient color, accent color
const FEATURES = [
  {
    icon: MousePointerClick,
    title: "Click Tracking",
    desc: "Record link visits with device information and a seven-day activity view so you can understand engagement.",
    color: "from-emerald-500/20 to-teal-500/10",
    accent: "#10b981",
  },
  {
    icon: BarChart3,
    title: "Click Analytics",
    desc: "Review total clicks, device split, and recent activity for each link in a compact dashboard.",
    color: "from-blue-500/20 to-indigo-500/10",
    accent: "#6366f1",
  },
  {
    icon: LockKeyhole,
    title: "Password Protection",
    desc: "Lock any link behind a secret passphrase. Share with confidence knowing only intended recipients can access.",
    color: "from-violet-500/20 to-purple-500/10",
    accent: "#8b5cf6",
  },
  {
    icon: Zap,
    title: "Fast Redirects",
    desc: "Send visitors to the destination after checking expiry, click limits, disabled status, and optional password protection.",
    color: "from-amber-500/20 to-orange-500/10",
    accent: "#f59e0b",
  },
  {
    icon: Globe,
    title: "Custom Aliases",
    desc: "Create memorable slugs for your links and share them from your LinkPulse site.",
    color: "from-pink-500/20 to-rose-500/10",
    accent: "#ec4899",
  },
  {
    icon: CalendarClock,
    title: "Expiry & Click Limits",
    desc: "Set a time limit or maximum number of visits so temporary links stop working automatically.",
    color: "from-cyan-500/20 to-sky-500/10",
    accent: "#06b6d4",
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="relative z-10 px-6 py-24 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">

        {/* ── Section Header ────────────────────────────────────────────────── */}
        <div className="mb-16 text-center">
          <div className="section-badge mx-auto mb-4">
            <Sparkles className="size-3.5 text-violet-400" /> FEATURES
          </div>
          <h2 className="section-title">
            Everything you need.<br />
            <span className="gradient-text">Nothing you don't.</span>
          </h2>
          <p className="section-sub mx-auto">
            A full suite of link intelligence tools built for marketers, developers, and creators.
          </p>
        </div>

        {/* ── Feature Cards Grid — 3 columns on large screens ──────────────── */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            // animationDelay se cards ek ke baad ek dikhte hain (staggered)
            <div
              key={feature.title}
              className="feature-card group"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Feature icon — gradient background wale box mein */}
              <div
                className={`feature-icon-bg bg-gradient-to-br ${feature.color}`}
                style={{ "--accent": feature.accent }}
              >
                <feature.icon className="size-5" style={{ color: feature.accent }} />
              </div>

              {/* Feature title */}
              <h3 className="mt-5 text-base font-medium" style={{ color: "var(--text-primary)" }}>{feature.title}</h3>

              {/* Feature description */}
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{feature.desc}</p>

              {/* Bottom accent line — hover pe visible hoti hai */}
              <div
                className="feature-line"
                style={{ background: `linear-gradient(90deg, ${feature.accent}40, transparent)` }}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
