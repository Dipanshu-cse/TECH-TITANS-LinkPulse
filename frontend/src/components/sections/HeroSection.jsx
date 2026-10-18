// ─── HeroSection.jsx ─────────────────────────────────────────────────────────
// Ye page ka sabse pehla (aur sabse bada) section hai.
// Isme ye sab hai:
//   - Background video (blur ke saath)
//   - Floating URL pills (decorative)
//   - Main headline "Links That Think For You."
//   - CTA buttons (Shorten a Link, See Features)
//   - Feature pillars (click tracking, password protection, expiry rules)
//   - Scroll indicator button (neeche arrow)
//   - Mouse parallax effect (hero glass layer mouse ke saath thoda tilt hoti hai)
//
// Props:
//   heroReady      — intro animation khatam hua ya nahi (text fade-in ke liye)
//   videoReady     — video zoom-in shuru karna hai ya nahi
//   theme          — "dark" ya "light" (video filter ke liye)
//   onScrollDown   — shortener section pe scroll karne ke liye function
//   onScrollFeatures — features section pe scroll karne ke liye function

import { useEffect, useRef } from "react"
import { ArrowDown, ArrowUpRight, ChevronRight, Sparkles } from "lucide-react"
import FloatingPill from "../ui-custom/FloatingPill"

export default function HeroSection({
  heroReady,
  videoReady,
  theme,
  onScrollDown,
  onScrollFeatures,
}) {
  // heroRef = poora hero section element (parallax calculation ke liye)
  // heroGlassRef = glass layer jo mouse se tilt hoti hai
  // heroParallaxFrame = animation frame ID (cleanup ke liye)
  const heroRef = useRef(null)
  const heroGlassRef = useRef(null)
  const heroParallaxFrame = useRef(null)

  // ── Mouse parallax effect — hero glass layer mouse pe react kare ───────────
  const handleHeroPointerMove = (event) => {
    // Touch screens aur reduced-motion users ke liye skip karo
    if (
      window.matchMedia("(hover: none)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return

    const bounds = heroRef.current?.getBoundingClientRect()
    if (!bounds) return

    // Mouse position ko center se relative coordinates mein convert karo
    // phir 40px range mein scale karo
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 40
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 40

    cancelAnimationFrame(heroParallaxFrame.current)
    heroParallaxFrame.current = requestAnimationFrame(() => {
      // CSS custom properties set karo — ye CSS mein use hoti hain
      heroGlassRef.current?.style.setProperty("--parallax-x", `${x}px`)
      heroGlassRef.current?.style.setProperty("--parallax-y", `${y}px`)
    })
  }

  // ── Mouse bahar jaane pe glass layer reset karo ────────────────────────────
  const resetHeroParallax = () => {
    cancelAnimationFrame(heroParallaxFrame.current)
    heroParallaxFrame.current = requestAnimationFrame(() => {
      heroGlassRef.current?.style.setProperty("--parallax-x", "0px")
      heroGlassRef.current?.style.setProperty("--parallax-y", "0px")
    })
  }

  // Cleanup — unmount pe pending animation frame cancel karo
  useEffect(() => () => cancelAnimationFrame(heroParallaxFrame.current), [])

  return (
    <section
      ref={heroRef}
      className="hero relative h-screen overflow-hidden flex items-end"
      onPointerLeave={resetHeroParallax}
      onPointerMove={handleHeroPointerMove}
    >
      {/* ── Background video layer — mouse se thoda move hoti hai ─────────── */}
      <div ref={heroGlassRef} className="hero-glass-layer absolute inset-[-5%] z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="hero-glass-video absolute inset-0 h-full w-full object-cover"
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/agentic-hero-9yW3wnTNMfn2U6lsVhTTZSJFEvAoSj.mp4"
          style={{
            // videoReady hone pe zoom in hota hai (scale 0.85 → 1.05)
            transform: videoReady ? "scale(1.05)" : "scale(0.85)",
            // Theme ke hisaab se brightness aur saturation change hoti hai
            filter: theme === "dark"
              ? "brightness(0.52) saturate(1.25) contrast(1.08)"
              : "brightness(1.08) saturate(0.68) contrast(0.92)",
            transition: "transform 2s cubic-bezier(0.16, 1, 0.3, 1), filter 0.7s ease",
          }}
        />
      </div>

      {/* ── Bottom gradient overlay — text ko background se separate karta hai */}
      <div
        className="hero-bottom-overlay absolute inset-x-0 bottom-0 h-[70%]"
        aria-hidden="true"
      />

      {/* ── Floating URL pills — right side pe decorative badges ─────────── */}
      <FloatingPill text="go.lp/launch-2025"   delay={0}   x={76} y={18} />
      <FloatingPill text="go.lp/product-hunt"  delay={1.2} x={78} y={38} className="floating-pill-hide-tablet" />
      <FloatingPill text="go.lp/investor-deck" delay={2.4} x={72} y={58} />
      <FloatingPill text="go.lp/waitlist"      delay={0.8} x={82} y={76} className="floating-pill-hide-tablet" />

      {/* ── Main hero content — headline, subtext, buttons ───────────────── */}
      <div className="hero-content relative z-[2] w-full px-6 pb-16 md:px-14 lg:px-20">
        <div className="max-w-5xl">

          {/* Badge — "Next-Gen URL Intelligence Platform" */}
          <div
            className="hero-badge mb-6"
            style={{
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? "translateY(0)" : "translateY(16px)",
              transition: "opacity .6s ease, transform .6s ease",
            }}
          >
            <Sparkles className="size-3 text-violet-400" />
            <span>Next-Gen URL Intelligence Platform</span>
          </div>

          {/* Main headline */}
          <h1
            className="hero-headline"
            style={{
              opacity: heroReady ? 1 : 0,
              filter: heroReady ? "blur(0px)" : "blur(24px)",
              transform: heroReady ? "translateY(0px)" : "translateY(32px)",
              transition: "opacity 1s cubic-bezier(0.16,1,0.3,1), filter 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            Links That<br />
            <span className="gradient-text">Think For You.</span>
          </h1>

          {/* Subtitle / description */}
          <p
            className="hero-sub"
            style={{
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? "translateY(0)" : "translateY(20px)",
              transition: "opacity .8s ease 120ms, transform .8s ease 120ms",
            }}
          >
            LinkPulse goes beyond shortening. Create memorable links with optional
            passwords, expiry rules, click limits, and useful visit analytics.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-wrap items-center gap-4 mt-8"
            style={{
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? "translateY(0)" : "translateY(20px)",
              transition: "opacity .8s ease 200ms, transform .8s ease 200ms",
            }}
          >
            {/* Primary button — shortener section pe le jaata hai */}
            <button onClick={onScrollDown} className="cta-primary">
              Shorten a Link <ArrowUpRight className="size-4" />
            </button>

            {/* Ghost button — features section pe le jaata hai */}
            <button onClick={onScrollFeatures} className="cta-ghost">
              See Features <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Feature pillars — 3 chhote text badges */}
          <div
            className="flex items-center gap-6 mt-10"
            style={{ opacity: heroReady ? 1 : 0, transition: "opacity .8s ease 280ms" }}
          >
            {["CLICK TRACKING", "PASSWORD PROTECTION", "EXPIRY RULES"].map((p, i) => (
              <div key={p} className="hero-pillar" style={{ transitionDelay: `${300 + i * 80}ms` }}>
                <span className="pillar-dot" />
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scroll indicator — bottom-right mein bouncing arrow button ───── */}
      <button onClick={onScrollDown} className="scroll-indicator z-30">
        <ArrowDown className="size-4 animate-bounce" />
      </button>
    </section>
  )
}
