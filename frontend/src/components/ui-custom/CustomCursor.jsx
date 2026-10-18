// ─── CustomCursor.jsx ────────────────────────────────────────────────────────
// Ye component default OS cursor ko replace karta hai ek glowing custom cursor se.
// Sirf desktop pe kaam karta hai (jahan fine pointer hota hai, jaise mouse).
// Mobile aur touch screens pe automatically hide ho jaata hai (CSS se).
// Features:
//   - Ek glowing dot (cursor-core) mouse ke saath move karta hai
//   - Ek trail (cursor-trail) movement ki direction mein stretch hoti hai
//   - Click karne pe ek ripple effect hota hai
//   - Buttons/links ke upar hover karne pe cursor thoda bada ho jaata hai

import { useEffect, useRef, useState } from "react"

export default function CustomCursor() {
  // cursorRef = glowing dot element
  // trailRef  = trail (puch) element
  const cursorRef = useRef(null)
  const trailRef = useRef(null)

  // positionRef = current mouse position (ref isliye ki re-render na ho)
  const positionRef = useRef({ x: -100, y: -100 })
  const targetPositionRef = useRef({ x: -100, y: -100 })

  // velocityRef = mouse kitna tez aur kis direction mein move kar raha hai
  const velocityRef = useRef({ x: 0, y: 0 })
  const frameRef = useRef(null)

  // isVisible = cursor screen pe hai ya nahi
  // isInteractive = kya cursor kisi clickable cheez (button/link) pe hai
  const [isVisible, setIsVisible] = useState(false)
  const [isInteractive, setIsInteractive] = useState(false)

  // rippleId = har click pe badhta hai taaki naya ripple element bane
  // ripplePosition = click ki position
  const [rippleId, setRippleId] = useState(0)
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // Sirf fine pointer (mouse) pe chalao — touch screen pe nahi
    const finePointer = window.matchMedia("(pointer: fine)")
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (!finePointer.matches || reducedMotion.matches) return undefined

    // HTML element pe class daal do taaki CSS cursor: none lagu ho
    document.documentElement.classList.add("cursor-enabled")

    // ── Har frame mein cursor aur trail ki position update karo ────────────
    const render = () => {
      const target = targetPositionRef.current
      const current = positionRef.current
      const velocity = velocityRef.current
      const x = current.x + (target.x - current.x) * 0.42
      const y = current.y + (target.y - current.y) * 0.42
      positionRef.current = { x, y }

      // Velocity smoothly zero ki taraf aati hai (damping)
      velocity.x *= 0.84
      velocity.y *= 0.84

      const speed = Math.hypot(velocity.x, velocity.y)

      // Speed se trail ki length decide hoti hai
      const trailLength = Math.min(18 + speed * 3.6, 150)

      // Angle se trail ki rotation decide hoti hai
      const angle = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI)

      // Cursor dot ko position pe lao (GPU-accelerated translate3d use karo)
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }

      // Trail ko position + angle + length ke saath update karo
      if (trailRef.current) {
        trailRef.current.style.transform =
          `translate3d(${x}px, ${y}px, 0) rotate(${angle}deg) scaleX(${trailLength / 180})`
        trailRef.current.style.opacity = `${Math.min(0.4 + speed / 20, 0.95)}`
      }

      frameRef.current = requestAnimationFrame(render)
    }

    // ── Mouse move event ─────────────────────────────────────────────────────
    const handleMove = (event) => {
      const previous = targetPositionRef.current

      // Velocity = current position - previous position
      velocityRef.current = {
        x: event.clientX - previous.x,
        y: event.clientY - previous.y
      }
      targetPositionRef.current = { x: event.clientX, y: event.clientY }
      setIsVisible(true)

      // Check karo kya mouse kisi interactive element pe hai
      const target = event.target instanceof Element
        ? event.target.closest("button, a, input, textarea, select, [data-cursor]")
        : null
      setIsInteractive(Boolean(target))
    }

    const handleLeave = () => setIsVisible(false)
    const handleEnter = () => setIsVisible(true)

    // ── Click pe ripple effect ───────────────────────────────────────────────
    const handleDown = (event) => {
      targetPositionRef.current = { x: event.clientX, y: event.clientY }
      setRipplePosition({ x: event.clientX, y: event.clientY })
      setRippleId(id => id + 1)  // naya unique ID = naya ripple
    }

    // Events attach karo
    window.addEventListener("pointermove", handleMove, { passive: true })
    window.addEventListener("pointerleave", handleLeave)
    window.addEventListener("pointerenter", handleEnter)
    window.addEventListener("pointerdown", handleDown, { passive: true })
    frameRef.current = requestAnimationFrame(render)

    // Cleanup — component unmount hone pe sab hata do
    return () => {
      document.documentElement.classList.remove("cursor-enabled")
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerleave", handleLeave)
      window.removeEventListener("pointerenter", handleEnter)
      window.removeEventListener("pointerdown", handleDown)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return (
    <div
      className={`custom-cursor-layer ${isVisible ? "is-visible" : ""} ${isInteractive ? "is-interactive" : ""}`}
      aria-hidden="true"
    >
      {/* Cursor ki puch (trail) */}
      <span ref={trailRef} className="cursor-trail" />

      {/* Cursor ka main glowing dot */}
      <span ref={cursorRef} className="cursor-core" />

      {/* Click pe ripple — key={rippleId} se har click pe naya element banta hai */}
      {rippleId > 0 && (
        <span
          key={rippleId}
          className="cursor-ripple"
          style={{ left: ripplePosition.x, top: ripplePosition.y }}
        />
      )}
    </div>
  )
}
