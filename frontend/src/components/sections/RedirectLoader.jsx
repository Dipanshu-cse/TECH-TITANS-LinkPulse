// ─── RedirectLoader.jsx ──────────────────────────────────────────────────────
// Ye screen tab dikhti hai jab koi user ek shortened link pe click karta hai.
// Jaise: koi "go.linkpulse.io/abc123" open kare to redirect hone se pehle
// ye loading screen dikhti hai.
// Background aur cursor bhi dikhte hain yahan.
//
// Ye component koi prop nahi leta — sirf ek simple loading UI hai.

import { Sparkles } from "lucide-react"
import AnimatedBackground from "../ui-custom/AnimatedBackground"
import CustomCursor from "../ui-custom/CustomCursor"

export default function RedirectLoader() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Custom cursor aur animated background yahan bhi chahiye */}
      <CustomCursor />
      <AnimatedBackground />

      {/* Centered loading content */}
      <div className="relative z-10 flex flex-col items-center gap-6">

        {/* LP logo badge — breathing animation ke saath */}
        <div className="redirect-logo">
          <span>LP</span>
        </div>

        {/* "Routing via GhostClick™" status message */}
        <div
          className="flex items-center gap-3 rounded-full px-6 py-3 backdrop-blur-xl"
          style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
        >
          <Sparkles className="size-4 animate-spin text-violet-400" />
          <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            Routing via GhostClick™ Bot Shield...
          </span>
        </div>

      </div>
    </main>
  )
}
