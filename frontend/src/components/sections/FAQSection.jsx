// ─── FAQSection.jsx ──────────────────────────────────────────────────────────
// Ye section "Frequently Asked Questions" dikhata hai.
// Questions and answers move together in a continuously looping rail.
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

export default function FAQSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="faq-section relative z-10 px-6 py-24 md:px-12 lg:px-20"
    >
      {/* Two-column layout: left = title, right = moving answers */}
      <div className="faq-layout mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">

        {/* ── Left Column — Title + Intro ────────────────────────────────── */}
        <div>
          <p className="faq-eyebrow">FREQUENTLY ASKED QUESTIONS</p>
          <h2 id="faq-title" className="faq-title">
            Everything you need to know about LinkPulse.
          </h2>
          <p className="faq-intro">Quick answers about creating, protecting, and tracking your links.</p>
        </div>

        {/* ── Right Column — Moving question and answer rail ───────────── */}
        <div className="faq-list">
          <div className="faq-marquee" aria-label="Frequently asked questions">
            <div className="faq-marquee-track">
              {[...FAQS, ...FAQS].map((faq, index) => {
                const originalIndex = index % FAQS.length
                const isDuplicate = index >= FAQS.length

                return (
                  <div
                    key={`${isDuplicate ? "duplicate-" : ""}${faq.question}`}
                    aria-hidden={isDuplicate}
                    className="faq-marquee-card"
                  >
                    <span className="faq-marquee-number">0{originalIndex + 1}</span>
                    <div className="faq-marquee-copy">
                      <span className="faq-marquee-question">{faq.question}</span>
                      <span className="faq-marquee-answer">{faq.answer}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
