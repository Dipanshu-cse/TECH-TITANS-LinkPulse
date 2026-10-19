// ─── CTABanner.jsx ───────────────────────────────────────────────────────────
// CTA = Call To Action. Ye ek bada banner hai page ke end ke paas.
// Iska kaam hai user ko encourage karna ki woh link shorten kare.
// Isme ek "Get Started Free" button hai jo shortener section pe scroll karta hai.
//
// Props:
//   onGetStarted — button click karne pe shortener section pe scroll kare

import { ArrowUpRight, Check, Mail } from "lucide-react"

export default function CTABanner({ onGetStarted }) {
  return (
    <section className="relative z-10 px-6 py-16 md:px-12 lg:px-20">
      <div className="mx-auto max-w-4xl">

        {/* Main closing banner */}
        <div className="cta-banner">
          {/* Glow effect — banner ke andar ek radial gradient hai */}
          <div className="cta-banner-glow" />

          {/* Content — centered text + button */}
          <div className="relative z-10 flex flex-col items-center gap-6 text-center">

            {/* Main heading */}
            <h2 className="text-4xl font-light tracking-tight md:text-5xl" style={{ color: "var(--text-primary)" }}>
              Ready to get started<span className="gradient-text">?</span>
            </h2>

            {/* Subtitle */}
            <p className="max-w-lg text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Create, protect, and track your links in seconds. No account or credit card needed.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={onGetStarted} className="cta-primary text-base px-8 py-4">
                Get Started Free <ArrowUpRight className="size-5" />
              </button>
              <a href="mailto:rahulmelkani4280@gmail.com" className="cta-ghost text-base px-7 py-4">
                Contact Us <Mail className="size-4" />
              </a>
            </div>

            <div className="cta-reassurance">
              {["No credit card required", "No login required", "Links saved on your device"].map(item => (
                <span key={item}><Check className="size-4" /> {item}</span>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
