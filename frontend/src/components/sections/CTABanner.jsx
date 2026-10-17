// ─── CTABanner.jsx ───────────────────────────────────────────────────────────
// CTA = Call To Action. Ye ek bada banner hai page ke end ke paas.
// Iska kaam hai user ko encourage karna ki woh link shorten kare.
// Isme ek "Get Started Free" button hai jo shortener section pe scroll karta hai.
//
// Props:
//   onGetStarted — button click karne pe shortener section pe scroll kare

import { ArrowUpRight, Star } from "lucide-react"

export default function CTABanner({ onGetStarted }) {
  return (
    <section className="relative z-10 px-6 py-16 md:px-12 lg:px-20">
      <div className="mx-auto max-w-4xl">

        {/* Main banner card — violet glow ke saath */}
        <div className="cta-banner">
          {/* Glow effect — banner ke andar ek radial gradient hai */}
          <div className="cta-banner-glow" />

          {/* Content — centered text + button */}
          <div className="relative z-10 flex flex-col items-center gap-6 text-center">

            {/* "Free for personal use" badge */}
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 border border-white/10">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs text-white/60">Free for personal use. No signup required.</span>
            </div>

            {/* Main heading */}
            <h2 className="text-4xl font-light tracking-tight md:text-5xl">
              Ready to pulse your <span className="gradient-text">links?</span>
            </h2>

            {/* Subtitle */}
            <p className="max-w-lg text-sm text-white/40 leading-relaxed">
              Join thousands of creators and marketers who trust LinkPulse for smarter, safer link management.
            </p>

            {/* CTA Button — shortener section pe le jaata hai */}
            <button onClick={onGetStarted} className="cta-primary text-base px-8 py-4">
              Get Started Free <ArrowUpRight className="size-5" />
            </button>

          </div>
        </div>

      </div>
    </section>
  )
}
