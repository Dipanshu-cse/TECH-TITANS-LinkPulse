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

import { useEffect, useState } from "react"
import QRCode from "qrcode"
import { Check, Copy, Download, ExternalLink, LockKeyhole, Share2, X } from "lucide-react"

export default function CreatedModal({ modalData, copied, onCopy, onClose, onViewTable }) {
  const [qrCode, setQrCode] = useState("")
  const [qrError, setQrError] = useState("")
  const [qrFor, setQrFor] = useState("")

  useEffect(() => {
    let active = true
    const workingUrl = modalData?.workingUrl || ""
    QRCode.toDataURL(workingUrl, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#11152B", light: "#FFFFFF" },
    })
      .then(dataUrl => {
        if (active) {
          setQrCode(dataUrl)
          setQrFor(workingUrl)
        }
      })
      .catch(() => {
        if (active) setQrError("QR code unavailable")
      })
    return () => { active = false }
  }, [modalData?.workingUrl])

  // Agar modalData null hai to modal render hi mat karo
  if (!modalData) return null

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "LinkPulse short link",
          text: "Open this link:",
          url: modalData.workingUrl,
        })
        return
      } catch (error) {
        if (error.name === "AbortError") return
      }
    }
    onCopy(modalData.workingUrl)
  }

  return (
    // Backdrop — clicking backdrop also closes the modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-md"
      onClick={onClose}
    >

      {/* Modal card — stopPropagation so clicking inside doesn't close */}
      <div className="modal-card" onClick={e => e.stopPropagation()}>

        {/* Confetti dots */}
        <div className="modal-confetti" aria-hidden="true">
          {[...Array(12)].map((_, i) => (
            <span key={i} className="confetti-dot" style={{ "--i": i }} />
          ))}
        </div>

        {/* Close button — z-20 so it sits above confetti layer and content */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 transition-colors"
          style={{ color: "var(--text-muted)", zIndex: 20 }}
        >
          <X className="size-4" />
        </button>

        {/* Modal Content */}
        <div className="relative p-6 md:p-8" style={{ zIndex: 10 }}>

          {/* "Link Ready" badge — green */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
            <Check className="size-3.5" /> Link Ready
          </div>

          {/* Title */}
          <h3 className="text-xl font-light" style={{ color: "var(--text-primary)" }}>Your link is live 🚀</h3>

          {/* Original URL dikhao (truncated) */}
          <p className="mt-1 truncate text-xs" style={{ color: "var(--text-muted)" }}>
            Redirects to: {modalData.originalUrl}
          </p>

          {/* Password protection indicator — sirf tab dikhata hai jab link protected ho */}
          {modalData.isProtected && (
            <p className="mt-1 text-xs font-medium text-violet-400 flex items-center gap-1.5">
              <LockKeyhole className="size-3" /> Password protection active
            </p>
          )}

          {/* ── Short link display + action buttons ───────────────────────── */}
          <div className="mt-5 flex items-center justify-between rounded-2xl border p-3 backdrop-blur-sm" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            {/* Branded display URL — monospace font mein */}
            <span className="truncate font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
              {modalData.workingUrl}
            </span>

            <div className="flex items-center gap-2 shrink-0 ml-3">
              {/* Open in new tab button */}
              <a
                href={modalData.workingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border p-2 transition-colors"
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-muted)" }}
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
              <button
                type="button"
                onClick={shareLink}
                className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs transition hover:bg-violet-500/10"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                <Share2 className="size-3.5" /> Share
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-col items-center gap-4 rounded-2xl border p-4 sm:flex-row" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div className="qr-preview shrink-0">
              {qrCode && qrFor === modalData.workingUrl ? <img src={qrCode} alt={`QR code for ${modalData.displayUrl}`} /> : <span>{qrError || "Generating QR..."}</span>}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Scan to open your link</p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>Share the QR code in presentations, print, or social posts.</p>
              {qrCode && qrFor === modalData.workingUrl && (
                <a
                  href={qrCode}
                  download={`linkpulse-${modalData.displayUrl.replace("go.lp/", "")}.png`}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs transition hover:bg-violet-500/10"
                  style={{ borderColor: "var(--border-strong)", color: "var(--text-secondary)" }}
                >
                  <Download className="size-3.5" /> Download QR
                </a>
              )}
            </div>
          </div>

          {/* ── Bottom actions ─────────────────────────────────────────────── */}
          <div className="mt-5 flex justify-end gap-2">
            {/* "View in table" — modal close karo aur table pe scroll karo */}
            <button
              onClick={onViewTable}
              className="rounded-xl border px-4 py-2 text-xs transition-colors hover:bg-violet-500/10"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              View in table
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
