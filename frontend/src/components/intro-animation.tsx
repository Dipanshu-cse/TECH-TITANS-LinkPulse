"use client"

import { useEffect, useState } from "react"

const BOOT_DELAY_MS = 1050
const CURTAIN_DURATION_MS = 760
const REDUCED_BOOT_DELAY_MS = 140
const REDUCED_CURTAIN_DURATION_MS = 180
const WORD = "LinkPulse"
const LETTER_INTERVAL_MS = 82

type Phase = "boot" | "reveal" | "done"

export function IntroAnimation({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("boot")
  const [typedLength, setTypedLength] = useState(0)

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const typingDuration = reduceMotion ? 0 : WORD.length * LETTER_INTERVAL_MS
    const bootDelay = reduceMotion ? REDUCED_BOOT_DELAY_MS : Math.max(BOOT_DELAY_MS, typingDuration + 220)
    const curtainDuration = reduceMotion ? REDUCED_CURTAIN_DURATION_MS : CURTAIN_DURATION_MS
    const typingTimers: number[] = []

    if (reduceMotion) {
      setTypedLength(WORD.length)
    } else {
      for (let index = 1; index <= WORD.length; index += 1) {
        typingTimers.push(window.setTimeout(() => setTypedLength(index), index * LETTER_INTERVAL_MS))
      }
    }

    const revealTimer = setTimeout(() => {
      setPhase("reveal")
      onDone()
    }, bootDelay)
    const finishTimer = setTimeout(() => setPhase("done"), bootDelay + curtainDuration + 80)

    return () => {
      typingTimers.forEach((timer) => window.clearTimeout(timer))
      clearTimeout(revealTimer)
      clearTimeout(finishTimer)
    }
  }, [onDone])

  if (phase === "done") return null

  return (
    <div className={`intro-screen intro-screen--${phase}`} aria-hidden="true">
      <div className="intro-content">
        <h1 className="intro-title" aria-label="LinkPulse">
          <span className="intro-title-link">{WORD.slice(0, Math.min(typedLength, 4))}</span>
          <span className="intro-title-pulse">{WORD.slice(4, typedLength)}</span>
          <span className="intro-caret" />
        </h1>
      </div>
    </div>
  )
}
