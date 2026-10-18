// ─── useTheme.js ─────────────────────────────────────────────────────────────
// Ye ek custom React hook hai jo theme (dark/light) ko manage karta hai.
// Custom hooks ka naam "use" se shuru hota hai — ye React ka rule hai.
//
// Ye hook kya karta hai:
//   1. Browser ya localStorage se initial theme decide karta hai
//   2. Theme change hone pe <html> element ka data-theme attribute update karta hai
//      (taaki CSS variables globally kaam karein)
//   3. Theme localStorage mein save karta hai (page reload ke baad bhi yaad rahe)
//   4. toggleTheme function return karta hai jisse dark/light switch ho sake
//
// Usage:
//   const { theme, toggleTheme } = useTheme()

import { useCallback, useEffect, useState } from "react"
import { flushSync } from "react-dom"

// ── Initial theme decide karna ────────────────────────────────────────────────
// Order: localStorage → OS preference → "dark" as fallback
function getInitialTheme() {
  // Pehle localStorage check karo (user ne pehle jo choose kiya tha)
  const savedTheme = localStorage.getItem("lp_theme") || localStorage.getItem("linkpulse_theme")
  if (savedTheme === "dark" || savedTheme === "light") return savedTheme

  // Agar localStorage mein nahi hai to OS preference dekho
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
}

export function useTheme() {
  // getInitialTheme function useState ko pass karo (lazy initialization)
  // Ye sirf ek baar run hoga — har render pe nahi
  const [theme, setTheme] = useState(getInitialTheme)

  // Theme change hone pe HTML element pe data-theme set karo + localStorage mein save karo
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("lp_theme", theme)
    localStorage.setItem("linkpulse_theme", theme)  // backward compatibility ke liye
  }, [theme])

  // Toggle function — dark → light ya light → dark
  // useCallback se ye function re-render pe recreate nahi hoga (performance optimization)
  const toggleTheme = useCallback((event) => {
    const nextTheme = theme === "dark" ? "light" : "dark"
    const updateTheme = () => flushSync(() => setTheme(nextTheme))
    if (event?.clientX && event?.clientY) {
      document.documentElement.style.setProperty("--theme-x", `${event.clientX}px`)
      document.documentElement.style.setProperty("--theme-y", `${event.clientY}px`)
    }

    if (typeof document.startViewTransition === "function") {
      document.startViewTransition(updateTheme)
    } else {
      document.documentElement.classList.add("theme-transitioning")
      updateTheme()
      window.setTimeout(() => {
        document.documentElement.classList.remove("theme-transitioning")
      }, 650)
    }
  }, [theme])

  // Hook se theme aur toggleTheme return karo
  return { theme, toggleTheme }
}
