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
  {
    question: "How do I create my first short link?",
    answer: "Paste a full URL that starts with http:// or https://, then select Create short link. LinkPulse generates a short address automatically; open Advanced options if you want to customize it.",
  },
  {
    question: "Can I set an expiry date or a click limit?",
    answer: "Yes. Open Advanced options to choose when a link expires, set a maximum number of clicks, or make it a one-time link. Leave these settings blank if you do not need a limit.",
  },
  {
    question: "What does a one-time link do?",
    answer: "A one-time link allows one verified click, then blocks future redirects to the destination.",
  },
  {
    question: "Can I pause a link and turn it back on later?",
    answer: "Yes. In Your links, use the enable or disable action for a link. A disabled link can be enabled again from the same list.",
  },
  {
    question: "Can I download a QR code for my short link?",
    answer: "Yes. After creating a link, the confirmation window shows its QR code and lets you download it as an image to share or print.",
  },
  {
    question: "Can I change the destination after creating a link?",
    answer: "The current version does not let you edit a link’s destination. Create a new short link with the updated URL instead.",
  },
  {
    question: "Which destination URLs are supported?",
    answer: "LinkPulse supports web addresses that use HTTP or HTTPS. Other URL types are not accepted.",
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
                    <span className="faq-marquee-number">{String(index + 1).padStart(2, "0")}</span>
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
