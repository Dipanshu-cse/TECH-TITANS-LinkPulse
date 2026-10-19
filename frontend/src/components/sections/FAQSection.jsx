// ─── FAQSection.jsx ──────────────────────────────────────────────────────────
import { useState } from "react"
import { ChevronDown } from "lucide-react"

// Ye section "Frequently Asked Questions" dikhata hai.
// FAQS array mein saare questions aur answers hain.
//
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
    question: "What analytics are available?",
    answer: "LinkPulse records visits, device type, and activity over the last seven days for each link.",
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

export default function FAQSection() {
  const [openQuestion, setOpenQuestion] = useState(0)

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="faq-section relative z-10 px-6 py-24 md:px-12 lg:px-20"
    >
      {/* Two-column layout: left = title, right = calm accordion */}
      <div className="faq-layout mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">

        {/* ── Left Column — Title + Intro ────────────────────────────────── */}
        <div>
          <p className="faq-eyebrow">FREQUENTLY ASKED QUESTIONS</p>
          <h2 id="faq-title" className="faq-title">
            Everything you need to know about LinkPulse.
          </h2>
          <p className="faq-intro">Quick answers about creating, protecting, and tracking your links.</p>
        </div>

        {/* ── Right Column — FAQ accordion ───────────────────────────────── */}
        <div className="faq-list">
          <div className="faq-accordion" aria-label="Frequently asked questions">
            {FAQS.map((faq, index) => {
              const isOpen = openQuestion === index
              return (
                <div key={faq.question} className={`faq-item ${isOpen ? "is-open" : ""}`}>
                  <button
                    type="button"
                    className="faq-trigger"
                    aria-expanded={isOpen}
                    onClick={() => setOpenQuestion(isOpen ? -1 : index)}
                  >
                    <span className="faq-marquee-number">0{index + 1}</span>
                    <span className="faq-marquee-question">{faq.question}</span>
                    <ChevronDown className="faq-chevron" aria-hidden="true" />
                  </button>
                  <div className="faq-answer-wrap" hidden={!isOpen}>
                    <p className="faq-marquee-answer">{faq.answer}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  )
}
