// ─── AnimatedBackground.jsx ──────────────────────────────────────────────────
// Ye component page ke peeche wala animated background banata hai.
// Isme 4 glowing "orbs" (bade rang ke circles), ek grid pattern,
// aur ek interactive dot field hai jo mouse ke saath react karta hai.

import { useEffect, useRef } from "react"

export default function AnimatedBackground() {
  // canvasRef se hum canvas element ko directly access karte hain (DOM element pakadne ke liye)
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    // 2D drawing context milta hai canvas ka — isse hum dots aur lines draw karte hain
    const context = canvas.getContext("2d")
    if (!context) return undefined

    // pointer = mouse ki current position track karta hai
    const pointer = { x: -1000, y: -1000, active: false }

    // Agar user ne browser mein "reduce motion" preference set ki hai to animation band karo
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let width = 0
    let height = 0
    let dots = []            // har dot ki position aur phase store hoti hai yahan
    let animationFrame      // requestAnimationFrame ka ID (cleanup ke liye)

    // ── Canvas ko resize karna jab window size change ho ──────────────────────
    const resize = () => {
      // High-DPI (Retina) screens ke liye pixel ratio adjust karo
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * ratio
      canvas.height = height * ratio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)

      // Naye size ke liye dots phir se banao
      dots = []
      const spacing = width < 700 ? 34 : 28   // mobile pe thoda bada gap
      for (let y = spacing / 2; y < height + spacing; y += spacing) {
        for (let x = spacing / 2; x < width + spacing; x += spacing) {
          // phase = random value taaki har dot alag speed se animate ho
          dots.push({ x, y, phase: Math.random() * Math.PI * 2 })
        }
      }
    }

    // ── Main draw loop — har frame mein ye chalti hai ──────────────────────────
    const draw = (time = 0) => {
      // Dark theme check: agar theme "light" nahi hai to dark hai
      const dark = document.documentElement.dataset.theme !== "light"

      // Pichla frame erase karo
      context.clearRect(0, 0, width, height)

      const motionTime = reduceMotion ? 0 : time * 0.0007
      const influenceRadius = 190   // mouse ke kitne area mein dots affect honge

      // activeDots = woh dots jo mouse ke kaafi kareeb hain (lines draw karne ke liye)
      const activeDots = []

      dots.forEach((dot) => {
        // Har dot thoda sa idhar-udhar "breathe" karta hai (sine wave se)
        const driftX = Math.sin(motionTime + dot.phase) * 2
        const driftY = Math.cos(motionTime * 0.8 + dot.phase) * 2
        const x = dot.x + driftX
        const y = dot.y + driftY

        // Mouse se distance calculate karo
        const distance = Math.hypot(pointer.x - x, pointer.y - y)

        // influence = mouse ke paas hone par 0 se 1 tak ka value
        const influence = pointer.active ? Math.max(0, 1 - distance / influenceRadius) : 0
        const wave = Math.sin(motionTime * 2 + dot.phase) * 0.12

        // Mouse ke paas wale dots bade aur zyada bright dikhte hain
        const radius = 1.1 + influence * 2.8
        const alpha = (dark ? 0.12 : 0.09) + influence * 0.7 + wave

        // Dot draw karo
        context.beginPath()
        context.arc(x, y, radius, 0, Math.PI * 2)
        context.fillStyle = dark
          ? `rgba(112, 211, 255, ${Math.max(0.04, alpha)})`
          : `rgba(109, 40, 217, ${Math.max(0.035, alpha * 0.72)})`
        context.fill()

        // Agar dot kaafi mouse ke paas hai to active list mein daal do
        if (influence > 0.55) activeDots.push({ x, y, influence })
      })

      // ── Active dots ke beech lines draw karo ──────────────────────────────
      context.lineWidth = 0.6
      activeDots.forEach((dot, index) => {
        activeDots.slice(index + 1).forEach((next) => {
          const distance = Math.hypot(dot.x - next.x, dot.y - next.y)
          if (distance < 58) {  // sirf kareeb wale dots ke beech line
            context.beginPath()
            context.moveTo(dot.x, dot.y)
            context.lineTo(next.x, next.y)
            context.strokeStyle = dark
              ? `rgba(99, 202, 255, ${0.16 * dot.influence})`
              : `rgba(124, 58, 237, ${0.10 * dot.influence})`
            context.stroke()
          }
        })
      })

      // ── Mouse ke aas-paas glow effect ─────────────────────────────────────
      if (pointer.active) {
        const glow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 210)
        glow.addColorStop(0, dark ? "rgba(63, 190, 255, 0.12)" : "rgba(139, 92, 246, 0.09)")
        glow.addColorStop(0.45, dark ? "rgba(63, 190, 255, 0.035)" : "rgba(139, 92, 246, 0.025)")
        glow.addColorStop(1, "rgba(0, 0, 0, 0)")
        context.fillStyle = glow
        context.fillRect(pointer.x - 210, pointer.y - 210, 420, 420)
      }

      // Agar reduce motion nahi hai to next frame request karo
      if (!reduceMotion) animationFrame = requestAnimationFrame(draw)
    }

    // ── Mouse movement track karna ────────────────────────────────────────────
    const movePointer = (event) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.active = true
    }
    const leavePointer = () => { pointer.active = false }

    // Setup: resize karo, draw shuru karo, aur events attach karo
    resize()
    draw()
    window.addEventListener("resize", resize)
    window.addEventListener("pointermove", movePointer, { passive: true })
    window.addEventListener("pointerleave", leavePointer)

    // Cleanup function: jab component unmount ho to sab hata do
    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("pointermove", movePointer)
      window.removeEventListener("pointerleave", leavePointer)
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, []) // [] = sirf ek baar run karo (mount pe)

  return (
    // pointer-events-none = ye sirf visual hai, click nahi hogi
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* 4 animated glowing orbs (colourful blurred circles) */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />

      {/* Subtle grid lines overlay */}
      <div className="grid-overlay" />

      {/* Interactive dot field — mouse se react karta hai */}
      <canvas ref={canvasRef} className="interactive-dot-field" />
    </div>
  )
}
