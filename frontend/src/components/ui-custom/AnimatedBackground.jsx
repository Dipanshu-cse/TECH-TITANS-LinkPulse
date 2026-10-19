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
    const pointer = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      vx: 0,
      vy: 0,
      lastMove: 0,
      trail: [],
      active: false,
    }

    // Agar user ne browser mein "reduce motion" preference set ki hai to animation band karo
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let width = 0
    let height = 0
    let nodes = []
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

      nodes = Array.from({ length: width < 700 ? 44 : 84 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        phase: Math.random() * Math.PI * 2,
        radius: 0.6 + Math.random() * 1.2,
      }))
    }

    // ── Main draw loop — har frame mein ye chalti hai ──────────────────────────
    let previousFrameTime = 0
    const draw = (time = 0) => {
      // Dark theme check: agar theme "light" nahi hai to dark hai
      const dark = document.documentElement.dataset.theme !== "light"

      // Pichla frame erase karo
      context.clearRect(0, 0, width, height)

      const motionTime = reduceMotion ? 0 : time * 0.0007
      const influenceRadius = 260
      const frameDelta = previousFrameTime ? Math.min(time - previousFrameTime, 40) : 16
      previousFrameTime = time
      const cursorEase = 1 - Math.exp(-frameDelta / 42)

      if (pointer.active) {
        pointer.x += (pointer.targetX - pointer.x) * cursorEase
        pointer.y += (pointer.targetY - pointer.y) * cursorEase
      }

      const pointerSpeed = Math.hypot(pointer.vx, pointer.vy)
      pointer.vx *= 0.92
      pointer.vy *= 0.92

      nodes.forEach((node) => {
        const driftX = Math.sin(motionTime * 0.9 + node.phase) * 10
        const driftY = Math.cos(motionTime * 0.7 + node.phase) * 10
        let x = node.x + driftX
        let y = node.y + driftY
        let streakX = driftX
        let streakY = driftY

        const distance = Math.hypot(pointer.x - x, pointer.y - y)
        const influence = pointer.active ? Math.max(0, 1 - distance / influenceRadius) : 0
        if (influence > 0) {
          const flow = influence * (2.4 + Math.min(pointerSpeed, 2) * 2.8)
          const safeDistance = Math.max(distance, 1)
          const offsetX = x - pointer.x
          const offsetY = y - pointer.y
          x += (-offsetY / safeDistance) * flow + pointer.vx * influence * 3
          y += (offsetX / safeDistance) * flow + pointer.vy * influence * 3
          streakX += pointer.vx * influence * 8
          streakY += pointer.vy * influence * 8
        }

        const angle = Math.atan2(streakY, streakX)
        const streakLength = node.radius * (1.5 + influence * 1.5 + Math.min(pointerSpeed, 2) * 0.25)
        context.beginPath()
        context.ellipse(x, y, streakLength, Math.max(0.45, node.radius * 0.52), angle, 0, Math.PI * 2)
        context.fillStyle = dark
          ? `rgba(125, 211, 252, ${0.18 + influence * 0.48})`
          : `rgba(109, 40, 217, ${0.12 + influence * 0.45})`
        context.fill()
      })

      const currentTime = time || performance.now()
      pointer.trail = pointer.trail.filter((point) => currentTime - point.time < 700)

      if (pointer.active && !reduceMotion) {
        const glow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 190)
        glow.addColorStop(0, dark ? `rgba(86, 216, 255, ${0.10 + Math.min(pointerSpeed, 2) * 0.025})` : "rgba(139, 92, 246, 0.07)")
        glow.addColorStop(0.42, dark ? "rgba(86, 216, 255, 0.035)" : "rgba(139, 92, 246, 0.025)")
        glow.addColorStop(1, "rgba(0, 0, 0, 0)")
        context.fillStyle = glow
        context.fillRect(pointer.x - 190, pointer.y - 190, 380, 380)

        if (pointer.trail.length > 1) {
          const trail = pointer.trail
          const oldest = trail[0]
          const newest = trail[trail.length - 1]
          const trailFade = Math.max(0, 1 - (currentTime - oldest.time) / 700)

          context.save()
          context.globalCompositeOperation = "lighter"
          context.beginPath()
          context.moveTo(oldest.x, oldest.y)
          for (let index = 1; index < trail.length - 1; index += 1) {
            const point = trail[index]
            const next = trail[index + 1]
            context.quadraticCurveTo(point.x, point.y, (point.x + next.x) * 0.5, (point.y + next.y) * 0.5)
          }
          context.lineTo(newest.x, newest.y)

          const ribbon = context.createLinearGradient(oldest.x, oldest.y, newest.x, newest.y)
          ribbon.addColorStop(0, dark ? `rgba(139, 92, 246, ${0.015 * trailFade})` : `rgba(124, 58, 237, ${0.015 * trailFade})`)
          ribbon.addColorStop(0.62, dark ? `rgba(86, 216, 255, ${0.20 * trailFade})` : `rgba(167, 139, 250, ${0.18 * trailFade})`)
          ribbon.addColorStop(1, dark ? `rgba(224, 246, 255, ${0.34 * trailFade})` : `rgba(255, 255, 255, ${0.28 * trailFade})`)
          context.strokeStyle = ribbon
          context.lineWidth = 4 + Math.min(pointerSpeed, 1.5)
          context.lineCap = "round"
          context.lineJoin = "round"
          context.shadowColor = dark ? "rgba(86, 216, 255, 0.35)" : "rgba(139, 92, 246, 0.28)"
          context.shadowBlur = 18
          context.stroke()
          context.restore()
        }

        const ripplePhase = (time % 1500) / 1500
        for (let ring = 0; ring < 2; ring += 1) {
          const phase = (ripplePhase + ring * 0.5) % 1
          context.beginPath()
          context.arc(pointer.x, pointer.y, 24 + phase * 76, 0, Math.PI * 2)
          context.strokeStyle = dark
            ? `rgba(86, 216, 255, ${(1 - phase) * 0.12})`
            : `rgba(124, 58, 237, ${(1 - phase) * 0.10})`
          context.lineWidth = 0.8
          context.stroke()
        }
      }

      // Agar reduce motion nahi hai to next frame request karo
      if (!reduceMotion) animationFrame = requestAnimationFrame(draw)
    }

    // ── Mouse movement track karna ────────────────────────────────────────────
    const movePointer = (event) => {
      const now = performance.now()
      const elapsed = Math.max(now - pointer.lastMove, 8)
      const deltaX = pointer.lastMove ? event.clientX - pointer.targetX : 0
      const deltaY = pointer.lastMove ? event.clientY - pointer.targetY : 0

      if (!pointer.active) {
        pointer.x = event.clientX
        pointer.y = event.clientY
      }
      pointer.vx = pointer.vx * 0.55 + (deltaX / elapsed) * 0.45
      pointer.vy = pointer.vy * 0.55 + (deltaY / elapsed) * 0.45
      pointer.targetX = event.clientX
      pointer.targetY = event.clientY
      pointer.lastMove = now
      pointer.active = true
      if (!reduceMotion) {
        pointer.trail.push({ x: event.clientX, y: event.clientY, time: now })
        if (pointer.trail.length > 24) pointer.trail.shift()
      } else {
        draw(now)
      }
    }
    const leavePointer = () => {
      pointer.active = false
      pointer.lastMove = 0
      pointer.trail = []
      if (reduceMotion) draw(performance.now())
    }

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

      {/* Ambient signal field — pointer par radar sweep aur arcs dikhata hai */}
      <canvas ref={canvasRef} className="interactive-signal-field" />
    </div>
  )
}
