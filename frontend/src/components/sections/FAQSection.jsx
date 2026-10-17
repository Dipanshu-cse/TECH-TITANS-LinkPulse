// ─── FAQSection.jsx ──────────────────────────────────────────────────────────
// Ye section "Frequently Asked Questions" dikhata hai.
// Accordion style mein hai — ek question click karne pe answer expand hota hai,
// doosra click karne pe collapse ho jaata hai.
// FAQS array mein saare questions aur answers hain.
//
// Props:
//   openFaq     — kaunsa FAQ open hai (index number ya null)
//   setOpenFaq  — open FAQ change karne ka function

import { Minus, Plus } from "lucide-react"

// ── FAQ Data Array ────────────────────────────────────────────────────────────
// Nayi FAQ add karni ho to yahan ek object add karo.
const FAQS = [
  {
    question: "What is LinkPulse?",
    answer: "LinkPulse turns long URLs into short links. You can customize a link with an alias, protect it with a password, and track its clicks.",
  },
  {
    question: "Is LinkPulse free?",
    answer: "LinkPulse is currently described as free for personal use, with no sign-up required.",
  },
  {
    question: "What is GhostClick™?",
    answer: "GhostClick™ is LinkPulse's bot-shield feature. It filters fake clicks so your click counts focus on real visitors.",
  },
  {
    question: "Can I password-protect a link?",
    answer: "Yes. Enable password protection when creating your link and choose a password. Visitors must enter it correctly to continue to the destination.",
  },
  {
    question: "Can I create a custom alias?",
    answer: "Yes. Enter an alias when creating your link. If it is already taken, LinkPulse will let you know so you can try another.",
  },
]

export default function FAQSection({ openFaq, setOpenFaq }) {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="faq-section relative z-10 px-6 py-24 md:px-12 lg:px-20"
    >
      {/* Two-column layout: left = title, right = accordion list */}
      <div className="faq-layout mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">

        {/* ── Left Column — Title + Intro ────────────────────────────────── */}
        <div>
          <p className="faq-eyebrow">FREQUENTLY ASKED QUESTIONS</p>
          <h2 id="faq-title" className="faq-title">
            Everything you need to know about LinkPulse.
          </h2>
          <p className="faq-intro">Quick answers about creating, protecting, and tracking your links.</p>
        </div>

        {/* ── Right Column — Accordion List ─────────────────────────────── */}
        <div className="faq-list">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index
            const answerId = `faq-answer-${index}`  // unique ID for accessibility

            return (
              <div className="faq-item" key={faq.question}>
                <h3 className="faq-question-heading">
                  {/* Question button — click pe toggle hota hai */}
                  <button
                    aria-controls={answerId}
                    aria-expanded={isOpen}
                    className="faq-question"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    type="button"
                  >
                    <span>{faq.question}</span>
                    {/* Open hone pe Minus icon, band hone pe Plus icon */}
                    {isOpen
                      ? <Minus aria-hidden="true" className="faq-icon" />
                      : <Plus aria-hidden="true" className="faq-icon" />}
                  </button>
                </h3>

                {/* Answer — CSS grid trick se smoothly animate karta hai */}
                {/* grid-template-rows: 0fr → 1fr animation se height 0 se auto hoti hai */}
                <div
                  aria-hidden={!isOpen}
                  className={`faq-answer${isOpen ? " is-open" : ""}`}
                  id={answerId}
                >
                  <div className="faq-answer-inner">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
