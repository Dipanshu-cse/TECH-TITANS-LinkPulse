// ─── GlassCard.jsx ───────────────────────────────────────────────────────────
// Ye ek simple reusable card component hai.
// "Glass" matlab — frosted glass jaisa dikhta hai (transparent + blur effect).
// glow prop true karne pe ek violet glow/shine bhi aata hai card ke edges pe.
//
// Usage example:
//   <GlassCard>         — normal transparent card
//   <GlassCard glow>    — glowing card (form jaisi jagah use karo)
//   <GlassCard className="p-6">  — custom padding add karo

export default function GlassCard({ children, className = "", glow = false }) {
  return (
    <div className={`glass-card ${glow ? "glass-card-glow" : ""} ${className}`}>
      {children}
    </div>
  )
}
