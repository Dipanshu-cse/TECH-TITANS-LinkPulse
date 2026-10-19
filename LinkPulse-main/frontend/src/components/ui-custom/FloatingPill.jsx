// ─── FloatingPill.jsx ────────────────────────────────────────────────────────
// Ye woh chhote floating URL badges hain jo hero section mein idhar-udhar
// float karte dikh'te hain (jaise "go.lp/launch-2025" wale).
// CSS animation se ye upar-neeche move karte hain — purely decorative hain.
//
// Props:
//   text      — pill ke andar jo text dikhega (jaise "go.lp/launch-2025")
//   delay     — animation shuru hone mein kitni der (seconds mein)
//   x         — horizontal position (0-100, percentage mein)
//   y         — vertical position (0-100, percentage mein)
//   className — koi extra CSS classes

export default function FloatingPill({ text, delay = 0, x = 0, y = 0, className = "" }) {
  return (
    <div
      className={`floating-pill ${className}`}
      style={{
        animationDelay: `${delay}s`,
        left: `${x}%`,
        top: `${y}%`,
      }}
    >
      {/* Chhota sa coloured dot pill ke suru mein */}
      <span className="pill-dot" />
      {text}
    </div>
  )
}
