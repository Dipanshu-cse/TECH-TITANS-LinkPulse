// ─── CreatedModal.jsx ────────────────────────────────────────────────────────
// Ye modal tab dikhta hai jab user successfully ek naya link create karta hai.
// Isme hai:
//   - Confetti dots animation (celebration effect)
//   - "Link Ready" green badge
//   - Short link ka display
//   - Copy button + Open in new tab button
//   - "View in table" button (modal close karo aur table pe scroll karo)
//
// Props:
//   modalData   — created link ki details (workingUrl, displayUrl, originalUrl, isProtected)
//   copied      — kaunsa URL copy hua hai (check icon ke liye)
//   onCopy      — copy function
//   onClose     — modal band karne ka function
//   onViewTable — "View in table" button — modal close + table pe scroll

import { Check, Copy, ExternalLink, LockKeyhole, X } from "lucide-react"

export default function CreatedModal({ modalData, copied, onCopy, onClose, onViewTable }) {
  // Agar modalData null hai to modal render hi mat karo
  if (!modalData) return null

  return (
    // Backdrop — semi-transparent blur overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-md">

      {/* Modal card */}
      <div className="modal-card">

        {/* ── Confetti dots animation — top pe colorful dots fall karte hain ── */}
        <div className="modal-confetti" aria-hidden="true">
          {/* 12 confetti dots — CSS se unki positions aur colors alag alag hain */}
          {[...Array(12)].map((_, i) => (
            <span key={i} className="confetti-dot" style={{ "--i": i }} />
          ))}
        </div>

        {/* Close button — top right corner mein X button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-white/30 hover:bg-white/5 hover:text-white/70 transition-colors z-10"
        >
          <X className="size-4" />
        </button>

        {/* ── Modal Content ─────────────────────────────────────────────────── */}
        <div className="relative z-10 p-6 md:p-8">

          {/* "Link Ready" badge — green */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
            <Check className="size-3.5" /> Link Ready
          </div>

          {/* Title */}
          <h3 className="text-xl font-light text-white">Your link is live 🚀</h3>

          {/* Original URL dikhao (truncated) */}
          <p className="mt-1 truncate text-xs text-white/35">
            Redirects to: {modalData.originalUrl}
          </p>

          {/* Password protection indicator — sirf tab dikhata hai jab link protected ho */}
          {modalData.isProtected && (
            <p className="mt-1 text-xs font-medium text-violet-400 flex items-center gap-1.5">
              <LockKeyhole className="size-3" /> Password protection active
            </p>
          )}

          {/* ── Short link display + action buttons ───────────────────────── */}
          <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
            {/* Branded display URL — monospace font mein */}
            <span className="truncate font-mono text-xs text-white/70">
              {modalData.displayUrl}
            </span>

            <div className="flex items-center gap-2 shrink-0 ml-3">
              {/* Open in new tab button */}
              <a
                href={modalData.workingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/40 hover:text-white/80 transition-colors"
              >
                <ExternalLink className="size-3.5" />
              </a>

              {/* Copy link button — click pe clipboard mein jaata hai */}
              <button
                type="button"
                onClick={() => onCopy(modalData.workingUrl)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-xs text-white transition hover:opacity-90 shadow-lg shadow-violet-500/20"
              >
                {/* Copy hua to green check + "Copied!", warna copy icon */}
                {copied === modalData.workingUrl
                  ? <><Check className="size-3.5 text-emerald-300" /> Copied!</>
                  : <><Copy className="size-3.5" /> Copy Link</>}
              </button>
            </div>
          </div>

          {/* ── Bottom actions ─────────────────────────────────────────────── */}
          <div className="mt-5 flex justify-end gap-2">
            {/* "View in table" — modal close karo aur table pe scroll karo */}
            <button
              onClick={onViewTable}
              className="rounded-xl border border-white/10 px-4 py-2 text-xs text-white/40 hover:bg-white/5 hover:text-white/70 transition-colors"
            >
              View in table
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
