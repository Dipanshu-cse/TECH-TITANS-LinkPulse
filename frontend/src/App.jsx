// ─── App.jsx ─────────────────────────────────────────────────────────────────
// Ye poori application ka main entry point hai.
// Iska kaam sirf yahi hai: saare pieces ko ek saath joorna.
//
// Kya hota hai yahan:
//   1. useTheme hook se theme (dark/light) manage hoti hai
//   2. useLinkManager hook se saari database logic aur form state manage hoti hai
//   3. Intro animation hoti hai — jab wo khatam ho tab hero section visible hota hai
//   4. Redirect check hota hai — agar URL mein koi slug hai to redirect loader dikhao
//   5. Saare sections ko render karo (HeroSection, ShortenerSection, etc.)
//
// ── File Structure ka Map (kaun kya karta hai) ────────────────────────────────
//  src/
//  ├── App.jsx                     ← YE FILE — sab kuch jodata hai
//  ├── main.jsx                    — React app ko DOM mein mount karta hai
//  ├── index.css                   — saari CSS (themes, components, animations)
// ├── supabase.js                 — Supabase database connection
//  ├── hooks/
//  │   ├── useTheme.js             — dark/light theme logic
//  │   └── useLinkManager.js       — saari database aur link form logic
//  ├── components/
//  │   ├── intro-animation.jsx     — page load pe hone wali intro animation
//  │   ├── mobile-nav.jsx          — mobile navigation bar
//  │   ├── ui-custom/
//  │   │   ├── AnimatedBackground.jsx — page ke peeche wala animated background
//  │   │   ├── CustomCursor.jsx       — glowing custom mouse cursor
//  │   │   ├── GlassCard.jsx          — reusable transparent card component
//  │   │   ├── FloatingPill.jsx       — hero mein floating URL badges
//  │   │   └── AnimatedCounter.jsx    — numbers smoothly count up karta hai
//  │   └── sections/
//  │       ├── HeroSection.jsx        — pehla bada hero section
//  │       ├── ShortenerSection.jsx   — URL shortener form + stats + table
//  │       ├── FeaturesSection.jsx    — 6 features ki grid
//  │       ├── HowItWorksSection.jsx  — 3 steps
//  │       ├── FAQSection.jsx         — accordion FAQs
//  │       ├── CTABanner.jsx          — "Get Started Free" banner
//  │       ├── Footer.jsx             — page ka footer
//  │       ├── CreatedModal.jsx       — link successfully create hone ka modal
//  │       └── RedirectLoader.jsx     — redirect hone ka loading screen

import { useCallback, useEffect, useRef, useState } from "react"
import { IntroAnimation, HERO_REVEAL_MS } from "./components/intro-animation"
import { MobileNav } from "./components/mobile-nav"

// ── Custom Hooks ──────────────────────────────────────────────────────────────
import { useTheme } from "./hooks/useTheme"
import { useLinkManager } from "./hooks/useLinkManager"

// ── Utility Components ────────────────────────────────────────────────────────
import AnimatedBackground from "./components/ui-custom/AnimatedBackground"
import CustomCursor from "./components/ui-custom/CustomCursor"

// ── Page Sections ─────────────────────────────────────────────────────────────
import HeroSection from "./components/sections/HeroSection"
import ShortenerSection from "./components/sections/ShortenerSection"
import FeaturesSection from "./components/sections/FeaturesSection"
import HowItWorksSection from "./components/sections/HowItWorksSection"
import FAQSection from "./components/sections/FAQSection"
import CTABanner from "./components/sections/CTABanner"
import Footer from "./components/sections/Footer"
import CreatedModal from "./components/sections/CreatedModal"
import RedirectLoader from "./components/sections/RedirectLoader"

export default function LinkPulsePage() {
  // ── Theme hook — dark/light mode manage karta hai ────────────────────────
  const { theme, toggleTheme } = useTheme()

  // ── Link Manager hook — database + form logic ────────────────────────────
  const linkManager = useLinkManager()

  // ── Intro Animation State ─────────────────────────────────────────────────
  // heroReady = intro animation khatam hua? (tab hero text dikhao)
  const [heroReady, setHeroReady] = useState(false)
  const handleIntroDone = useCallback(() => setHeroReady(true), [])

  // videoReady = kya hero background video zoom-in shuru kare?
  // HERO_REVEAL_MS ke baad video scale up hoti hai
  const [videoReady, setVideoReady] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setVideoReady(true), HERO_REVEAL_MS)
    return () => clearTimeout(timer)
  }, [])

  // ── Scroll Refs ───────────────────────────────────────────────────────────
  // Shortener section pe smooth scroll karne ke liye
  const shortenerRef = useRef(null)
  const scrollToShortener = () => shortenerRef.current?.scrollIntoView({ behavior: "smooth" })
  const scrollToFeatures = () => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })

  // ── Redirect Screen ───────────────────────────────────────────────────────
  // Agar koi shortened link open kara ja raha hai to sirf loading screen dikhao
  if (linkManager.redirecting) {
    return <RedirectLoader />
  }

  // ── Main Page Render ──────────────────────────────────────────────────────
  return (
    <main
      className="min-h-screen font-sans antialiased overflow-x-hidden"
      style={{ color: "var(--text-primary)" }}
    >
      {/* ── Global decorative elements (har section mein common) ─────────── */}
      <CustomCursor />
      <AnimatedBackground />

      {/* ── Intro animation — page load pe pehli baar dikhti hai ─────────── */}
      <IntroAnimation onDone={handleIntroDone} />

      {/* ── Mobile navigation bar ─────────────────────────────────────────── */}
      <MobileNav
        onGetStarted={scrollToShortener}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE SECTIONS — upar se neeche
         ══════════════════════════════════════════════════════════════════════ */}

      {/* 1. Hero Section — fullscreen video background + headline + CTAs */}
      <HeroSection
        heroReady={heroReady}
        videoReady={videoReady}
        theme={theme}
        onScrollDown={scrollToShortener}
        onScrollFeatures={scrollToFeatures}
      />

      {/* 2. Shortener Section — link banane ka form + stats + table */}
      <ShortenerSection
        sectionRef={shortenerRef}
        tableRef={linkManager.tableRef}
        links={linkManager.links}
        loading={linkManager.loading}
        totalClicks={linkManager.totalClicks}
        activeLinksCount={linkManager.activeLinksCount}
        longUrl={linkManager.longUrl}
        setLongUrl={linkManager.setLongUrl}
        alias={linkManager.alias}
        setAlias={linkManager.setAlias}
        aliasError={linkManager.aliasError}
        setAliasError={linkManager.setAliasError}
        passwordProtected={linkManager.passwordProtected}
        setPasswordProtected={linkManager.setPasswordProtected}
        password={linkManager.password}
        setPassword={linkManager.setPassword}
        generating={linkManager.generating}
        copied={linkManager.copied}
        onSubmit={linkManager.handleGenerate}
        onCopy={linkManager.copyLink}
        onToggleDisable={linkManager.toggleDisable}
        onDelete={linkManager.deleteLink}
        expiresAt={linkManager.expiresAt}
        setExpiresAt={linkManager.setExpiresAt}
        clickLimit={linkManager.clickLimit}
        setClickLimit={linkManager.setClickLimit}
      />

      {/* 3. Features Section — 6 feature cards grid */}
      <FeaturesSection />

      {/* 4. How It Works Section — 3 steps with connector line */}
      <HowItWorksSection />

      {/* 5. FAQ Section — continuously moving questions and answers */}
      <FAQSection />

      {/* 6. CTA Banner — "Get Started Free" promotional banner */}
      <CTABanner onGetStarted={scrollToShortener} />

      {/* 7. Footer — logo + credits */}
      <Footer theme={theme} />

      {/* ── Modal — link create hone ke baad popup ────────────────────────── */}
      {/* Sirf tab render hota hai jab createdModal null nahi ho */}
      <CreatedModal
        modalData={linkManager.createdModal}
        copied={linkManager.copied}
        onCopy={linkManager.copyLink}
        onClose={linkManager.closeModal}
        onViewTable={linkManager.viewInTable}
      />
    </main>
  )
}
