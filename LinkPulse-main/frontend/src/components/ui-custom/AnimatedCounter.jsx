// ─── AnimatedCounter.jsx ─────────────────────────────────────────────────────
// Ye component ek number ko smoothly 0 se target value tak animate karta hai.
// Stats section mein use hota hai (jaise "Total Clicks: 0 → 142" wali animation).
//
// Props:
//   value  — target number (jis tak count karna hai)
//   suffix — number ke baad koi text add karna ho (jaise "+", "k", "%")
//
// Kaise kaam karta hai:
//   value change hone pe ek setInterval shuru hota hai jo display ko
//   step-by-step badhata hai jab tak value tak nahi pahunch jaata.

import { useEffect, useState } from "react"

export default function AnimatedCounter({ value, suffix = "" }) {
  // display = abhi screen pe jo number dikh raha hai
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let start = 0
    const end = Number(value)

    // Agar value 0 hai to seedha 0 set karo, koi animation nahi
    if (end === 0) {
      const timer = setTimeout(() => setDisplay(0), 0)
      return () => clearTimeout(timer)
    }

    // Kitne steps mein value tak pahunchna hai (~40 steps)
    const step = Math.ceil(end / 40)

    // Har 30ms pe display badhao
    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        setDisplay(end)      // exact value pe rok do
        clearInterval(timer)
      } else {
        setDisplay(start)
      }
    }, 30)

    return () => clearInterval(timer)
  }, [value]) // value change hone pe dobara run karo

  return (
    // toLocaleString() se number mein commas aate hain (jaise 1,234)
    <>{display.toLocaleString()}{suffix}</>
  )
}
