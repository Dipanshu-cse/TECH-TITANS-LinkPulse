import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronDown, Copy,
  ExternalLink, Globe2, Link2, LockKeyhole, Menu, MousePointer2,
  ShieldCheck, X, Zap
} from "lucide-react"
import { supabase } from "./supabase"

const FAQS = [
  {
    question: "What is LinkPulse?",
    answer: "LinkPulse is a link-shortening prototype. Create a short URL, choose an optional custom alias, and see its recorded click count.",
  },
  {
    question: "How does LinkPulse detect bots?",
    answer: "Bot detection is not implemented in this prototype. The traffic examples on this page are illustrative only; LinkPulse currently records total clicks without classifying visitors.",
  },
  {
    question: "Does LinkPulse use AI or machine learning?",
    answer: "No. There is no AI or machine-learning analysis behind the current product. We describe the direction we are exploring, not a capability that is live today.",
  },
  {
    question: "Can I see who clicked my link?",
    answer: "No. The current dashboard shows a total click count per link. It does not identify individual visitors or provide unique-visitor, location, device, or referrer analytics.",
  },
  {
    question: "Can I password-protect a link?",
    answer: "Yes. You can set a passphrase when creating a link. This is a prototype implementation, so avoid using sensitive destinations or passwords until the feature has received production security review.",
  },
  {
    question: "Can I make a link expire or change its destination?",
    answer: "Not yet. Expiration dates, destination editing, and link disabling are not available in the current interface.",
  },
  {
    question: "Can I create a custom link?",
    answer: "Yes. Enter an optional alias when you create a link. Aliases must be unique; if one is already in use, choose another.",
  },
]

const CAPABILITIES = [
  { icon: Link2, label: "Short links" },
  { icon: LockKeyhole, label: "Optional passphrase" },
  { icon: MousePointer2, label: "Total click counts" },
  { icon: Zap, label: "Instant redirects" },
]

const STEPS = [
  { number: "01", title: "Create", description: "Paste a destination and choose a short, memorable alias." },
  { number: "02", title: "Share", description: "Copy your new link and put it wherever your audience is." },
  { number: "03", title: "Understand", description: "See the total number of clicks recorded for each link." },
]

function getVisitorId() {
  let id = localStorage.getItem("linkpulse_visitor_id")
  if (!id) {
    id = `usr_${Math.random().toString(36).substring(2, 9)}${Date.now().toString(36)}`
    localStorage.setItem("linkpulse_visitor_id", id)
  }
  return id
}

function getLinks(visitorId) {
  return supabase
    .from("links")
    .select("*")
    .eq("visitor_id", visitorId)
    .order("created_at", { ascending: false })
}

function BrandMark({ small = false }) {
  return (
    <a className={`brand${small ? " brand-small" : ""}`} href="#top" aria-label="LinkPulse home">
      <span className="brand-symbol" aria-hidden="true"><span /></span>
      <span>LinkPulse</span>
    </a>
  )
}

function SectionHeading({ eyebrow, title, description, align = "left" }) {
  return (
    <div className={`section-heading section-heading-${align}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {description && <p className="section-description">{description}</p>}
    </div>
  )
}

export default function LinkPulsePage() {
  const [longUrl, setLongUrl] = useState("")
  const [alias, setAlias] = useState("")
  const [aliasError, setAliasError] = useState("")
  const [passwordProtected, setPasswordProtected] = useState(false)
  const [password, setPassword] = useState("")
  const [links, setLinks] = useState([])
  const [linksError, setLinksError] = useState("")
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState("")
  const [copyError, setCopyError] = useState("")
  const [createdLink, setCreatedLink] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(0)
  const formRef = useRef(null)
  const tableRef = useRef(null)
  const redirecting = Boolean(window.location.pathname.replace(/^\/+/, "").trim())

  useEffect(() => {
    const slug = window.location.pathname.replace(/^\/+/, "").trim()
    if (!slug) return

    async function processRedirect() {
      try {
        const { data, error } = await supabase
          .from("links")
          .select("id, original_url, clicks_count, is_disabled, password_hash")
          .eq("short_code", slug)
          .single()
        if (error || !data) {
          alert("Link not found or expired.")
          window.location.href = "/"
          return
        }
        if (data.is_disabled) {
          alert("This link has been disabled.")
          window.location.href = "/"
          return
        }
        const hasPassword = Boolean(data.password_hash && data.password_hash.trim().length > 0)
        if (hasPassword) {
          const enteredPassword = window.prompt("This link is password protected. Enter the access password:")
          if (!enteredPassword || enteredPassword.trim() !== data.password_hash.trim()) {
            alert("Incorrect password or access cancelled.")
            window.location.href = "/"
            return
          }
        }
        const { error: clickUpdateError } = await supabase
          .from("links")
          .update({ clicks_count: (data.clicks_count || 0) + 1 })
          .eq("id", data.id)
        if (clickUpdateError) console.error("Unable to record link click:", clickUpdateError.message)
        const destination = data.original_url.startsWith("http://") || data.original_url.startsWith("https://")
          ? data.original_url : `https://${data.original_url}`
        window.location.href = destination
      } catch (error) {
        console.error("Unable to open short link:", error)
        alert("Unable to open this link right now.")
        window.location.href = "/"
      }
    }
    processRedirect()
  }, [])

  const fetchLinks = useCallback(async () => {
    setLoading(true)
    setLinksError("")
    try {
      const { data, error } = await getLinks(getVisitorId())
      if (error) {
        console.error("Error fetching links:", error.message)
        setLinksError("Could not load links. Try refreshing.")
      } else if (data) setLinks(data)
    } catch (error) {
      console.error("Error fetching links:", error)
      setLinksError("Could not load links. Try refreshing.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadInitialLinks() {
      try {
        const { data, error } = await getLinks(getVisitorId())
        if (cancelled) return
        if (error) {
          console.error("Error fetching links:", error.message)
          setLinksError("Could not load links. Try refreshing.")
        }
        else if (data) setLinks(data)
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching links:", error)
          setLinksError("Could not load links. Try refreshing.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadInitialLinks()
    return () => { cancelled = true }
  }, [])

  const totalClicks = useMemo(
    () => links.reduce((sum, link) => sum + (Number(link.clicks_count) || 0), 0),
    [links],
  )
  const activeLinksCount = useMemo(
    () => links.filter(link => !link.is_disabled).length,
    [links],
  )
  const protectedLinksCount = useMemo(
    () => links.filter(link => Boolean(link.password_hash)).length,
    [links],
  )

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "center",
    })
    window.setTimeout(() => document.getElementById("destination-url")?.focus(), 250)
  }

  const handleGenerate = async (event) => {
    event.preventDefault()
    setAliasError("")
    setCreatedLink(null)
    if (!longUrl.trim()) return
    if (passwordProtected && !password.trim()) {
      setAliasError("Enter a passphrase or turn off password protection.")
      return
    }

    setGenerating(true)
    const slug = alias.trim()
      ? alias.trim().replace(/\s+/g, "").toLowerCase()
      : Math.random().toString(36).substring(2, 8)
    const isProtected = Boolean(passwordProtected && password.trim().length > 0)
    const newRecord = {
      original_url: longUrl.trim(),
      short_code: slug,
      clicks_count: 0,
      is_disabled: false,
      visitor_id: getVisitorId(),
      password_hash: isProtected ? password.trim() : null,
    }

    try {
      const { data, error } = await supabase.from("links").insert([newRecord]).select()
      if (error) {
        if (error.code === "23505") setAliasError(`Alias "${slug}" is already taken. Try another.`)
        else {
          setAliasError("Unable to save this link right now. Please try again.")
          console.error("Insert error:", error)
        }
        return
      }
      if (data?.length) {
        const link = data[0]
        setLinks(previous => [link, ...previous])
        setLongUrl("")
        setAlias("")
        setPassword("")
        setPasswordProtected(false)
        setCreatedLink({
          url: `${window.location.origin}/${link.short_code}`,
          code: link.short_code,
          isProtected: Boolean(link.password_hash),
        })
      } else {
        setAliasError("The link could not be created. Please try again.")
      }
    } catch (error) {
      console.error("Unable to create link:", error)
      setAliasError("Unable to save this link right now. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  const copyLink = async (text) => {
    setCopyError("")
    try {
      await navigator.clipboard.writeText(text)
      setCopied(text)
      window.setTimeout(() => setCopied(current => current === text ? "" : current), 1800)
    } catch (error) {
      console.error("Unable to copy link:", error)
      setCopyError("Copy failed. Select and copy the link instead.")
    }
  }

  if (redirecting) {
    return (
      <main className="redirect-screen">
        <BrandMark />
        <div className="redirect-message"><span className="loading-spinner" /> Opening your link…</div>
      </main>
    )
  }

  return (
    <main id="top">
      <header className="site-header">
        <div className="nav-shell">
          <BrandMark />
          <button
            className="mobile-menu-button"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMenuOpen(open => !open)}
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
          <nav id="primary-navigation" className={`primary-navigation${menuOpen ? " is-open" : ""}`} aria-label="Main navigation">
            <a href="#product" onClick={() => setMenuOpen(false)}>Product</a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#workspace" onClick={() => setMenuOpen(false)}>Your links</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
            <button className="button button-small" type="button" onClick={() => { setMenuOpen(false); scrollToForm() }}>
              Create a link <ArrowUpRight size={15} />
            </button>
          </nav>
        </div>
      </header>

      <section className="hero section-wrap" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-mark" /> Link management, with more context</p>
          <h1 id="hero-title">Your links.<br /><span>Protected by intelligence.</span></h1>
          <p className="hero-description">
            Give every destination a shorter address. Add a passphrase when you need one, then keep an eye on total clicks.
          </p>
          <div className="hero-actions">
            <button className="button" type="button" onClick={scrollToForm}>
              Create your link <ArrowRight size={16} />
            </button>
            <a className="text-link" href="#product">Explore the product <ArrowDownRight size={16} /></a>
          </div>
          <p className="prototype-note">A link-shortening prototype. Bot detection and AI analysis are not live features.</p>
        </div>

        <div className="create-panel" ref={formRef} id="product">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">LINK BUILDER <span>01 / 01</span></p>
              <h2>Create a short link</h2>
            </div>
            <span className="panel-icon"><Link2 size={19} /></span>
          </div>
          <form onSubmit={handleGenerate}>
            <label className="field-label" htmlFor="destination-url">Destination URL</label>
            <div className="input-wrap">
              <Globe2 size={17} aria-hidden="true" />
              <input
                id="destination-url"
                required
                type="url"
                value={longUrl}
                onChange={event => setLongUrl(event.target.value)}
                placeholder="https://example.com/your-page"
                autoComplete="url"
              />
            </div>
            <label className="field-label alias-label" htmlFor="custom-alias">
              Custom alias <span>Optional</span>
            </label>
            <div className={`input-wrap alias-input${aliasError ? " has-error" : ""}`}>
              <span className="alias-prefix">linkpulse /</span>
              <input
                id="custom-alias"
                value={alias}
                onChange={event => { setAlias(event.target.value); if (aliasError) setAliasError("") }}
                placeholder="your-link"
                autoComplete="off"
                aria-describedby={aliasError ? "form-error" : undefined}
              />
            </div>
            <label className="password-option">
              <input
                type="checkbox"
                checked={passwordProtected}
                onChange={event => setPasswordProtected(event.target.checked)}
              />
              <span className="checkbox-visual"><Check size={13} /></span>
              <LockKeyhole size={16} aria-hidden="true" />
              Add a passphrase
            </label>
            {passwordProtected && (
              <label className="field-label password-field" htmlFor="link-password">
                Passphrase
                <input
                  id="link-password"
                  className="text-input"
                  type="password"
                  required
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  placeholder="Choose a passphrase"
                  autoComplete="new-password"
                />
              </label>
            )}
            {aliasError && <p className="form-error" id="form-error" role="alert">{aliasError}</p>}
            <button className="button button-submit" type="submit" disabled={generating}>
              {generating ? <><span className="loading-spinner" /> Creating link…</> : <>Create short link <ArrowRight size={16} /></>}
            </button>
          </form>
          {createdLink && (
            <div className="created-result" role="status" aria-live="polite">
              <div className="result-title"><span><Check size={15} /></span> Your link is ready</div>
              <div className="result-link-row">
                <a href={createdLink.url} target="_blank" rel="noreferrer">{createdLink.url}</a>
                <button className="icon-button" type="button" onClick={() => copyLink(createdLink.url)} aria-label="Copy new short link">
                  {copied === createdLink.url ? <Check size={16} /> : <Copy size={16} />}
                </button>
                <a className="icon-button" href={createdLink.url} target="_blank" rel="noreferrer" aria-label="Open new short link">
                  <ExternalLink size={16} />
                </a>
              </div>
              {createdLink.isProtected && <p className="result-caption"><LockKeyhole size={13} /> Passphrase required to open</p>}
            </div>
          )}
          {copyError && <p className="form-error" role="alert">{copyError}</p>}
          <p className="panel-footnote">Your links and click counts are saved to your browser workspace.</p>
        </div>
      </section>

      <section className="capability-strip" aria-label="Current LinkPulse capabilities">
        <div className="capability-inner">
          <span className="capability-intro">Available in this prototype</span>
          {CAPABILITIES.map(({ icon: Icon, label }) => (
            <span className="capability-item" key={label}><Icon size={15} /> {label}</span>
          ))}
        </div>
      </section>

      <section className="story-section section-wrap" id="intelligence">
        <div className="story-copy">
          <SectionHeading
            eyebrow="THE OPPORTUNITY"
            title={<>A click isn't<br />always a person.</>}
            description="LinkPulse records that a link was opened. Knowing more about who—or what—opened it is the next challenge, not a claim we make today."
          />
          <a className="text-link" href="#how-it-works">See what works today <ArrowRight size={16} /></a>
        </div>
        <div className="traffic-panel">
          <div className="traffic-panel-top">
            <div><span className="traffic-kicker">TRAFFIC EXAMPLE</span><h3>One link. Different visitors.</h3></div>
            <span className="demo-badge">Illustrative</span>
          </div>
          <div className="traffic-flow">
            <div className="traffic-origin"><span className="origin-pulse" /><span>Shared link</span><code>/summer-note</code></div>
            <div className="traffic-rows">
              <div className="traffic-row"><span className="traffic-dot human" /><span>Human visitor</span><span className="traffic-state">Example</span></div>
              <div className="traffic-row"><span className="traffic-dot bot" /><span>Automated request</span><span className="traffic-state">Example</span></div>
              <div className="traffic-row"><span className="traffic-dot review" /><span>Unusual pattern</span><span className="traffic-state">Example</span></div>
            </div>
          </div>
          <p className="illustration-caption">Concept only — visitor classification is not implemented.</p>
        </div>
      </section>

      <section className="process-section" id="how-it-works">
        <div className="section-wrap">
          <SectionHeading
            eyebrow="A SIMPLE START"
            title={<>Shorten first.<br /><span>Build from there.</span></>}
            description="The current product keeps link creation straightforward, while making space for more useful traffic context over time."
          />
          <div className="steps-grid">
            {STEPS.map(step => (
              <article className="step-item" key={step.number}>
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
          <div className="roadmap-note">
            <ShieldCheck size={19} />
            <p><strong>Built with a clear boundary.</strong> The prototype counts clicks and supports optional passphrases. It does not currently classify bots, score destinations, or provide geographic analytics.</p>
          </div>
        </div>
      </section>

      <section className="workspace-section section-wrap" id="workspace">
        <div className="workspace-heading">
          <SectionHeading
            eyebrow="YOUR WORKSPACE"
            title="A clear view of your links."
            description="Link records and click totals for this browser workspace."
          />
          <button className="button button-secondary" type="button" onClick={scrollToForm}>
            New link <ArrowUpRight size={15} />
          </button>
        </div>

        <div className="metrics-grid">
          <article className="metric-panel">
            <span>Total clicks <MousePointer2 size={15} /></span>
            <strong>{totalClicks.toLocaleString()}</strong>
            <small>Recorded across your links</small>
          </article>
          <article className="metric-panel">
            <span>Active links <Link2 size={15} /></span>
            <strong>{activeLinksCount.toLocaleString()}</strong>
            <small>In this browser workspace</small>
          </article>
          <article className="metric-panel">
            <span>Passphrase links <LockKeyhole size={15} /></span>
            <strong>{protectedLinksCount.toLocaleString()}</strong>
            <small>Access prompt enabled</small>
          </article>
        </div>

        <div className="links-panel" ref={tableRef}>
          <div className="links-panel-heading">
            <div><h3>Recent links</h3><p>Click totals are not unique-visitor counts.</p></div>
            <button className="refresh-button" type="button" onClick={fetchLinks} disabled={loading}>
              {loading ? <><span className="loading-spinner" /> Refreshing</> : "Refresh"}
            </button>
          </div>
          <div className="table-scroll">
            <table>
              <thead><tr><th scope="col">Short link</th><th scope="col">Destination</th><th scope="col">Status</th><th scope="col">Clicks</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td className="table-message" colSpan="4"><span className="loading-spinner" /> Loading your links…</td></tr>
                ) : linksError ? (
                  <tr><td className="table-message empty-message" colSpan="4" role="alert">{linksError}</td></tr>
                ) : links.length === 0 ? (
                  <tr><td className="table-message empty-message" colSpan="4"><Link2 size={19} /><span>No links yet. Your first one can start here.</span></td></tr>
                ) : links.map(link => {
                  const directUrl = `${window.location.origin}/${link.short_code}`
                  return (
                    <tr key={link.id || link.short_code}>
                      <td>
                        <div className="table-short-link">
                          <a href={directUrl} target="_blank" rel="noreferrer">/{link.short_code}</a>
                          <button className="icon-button" type="button" onClick={() => copyLink(directUrl)} aria-label={`Copy link ${link.short_code}`}>
                            {copied === directUrl ? <Check size={15} /> : <Copy size={15} />}
                          </button>
                        </div>
                      </td>
                      <td className="destination-cell" title={link.original_url}>{link.original_url}</td>
                      <td><span className={`status-label${link.is_disabled ? " is-disabled" : ""}`}><span />{link.is_disabled ? "Disabled" : link.password_hash ? "Passphrase" : "Active"}</span></td>
                      <td className="click-count">{Number(link.clicks_count) || 0}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {copyError && <p className="table-error" role="alert">{copyError}</p>}
        </div>
      </section>

      <section className="faq-section" id="faq">
        <div className="section-wrap faq-layout">
          <SectionHeading
            eyebrow="GOOD TO KNOW"
            title="Questions, answered."
            description="Clear about what is—and isn't—in the prototype."
          />
          <div className="faq-list">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index
              const panelId = `faq-answer-${index}`
              return (
                <article className={`faq-item${isOpen ? " is-open" : ""}`} key={faq.question}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    >
                      {faq.question}<ChevronDown size={18} />
                    </button>
                  </h3>
                  <div className="faq-answer" id={panelId} hidden={!isOpen}>
                    <p>{faq.answer}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="final-cta section-wrap">
        <div className="final-cta-copy">
          <p className="eyebrow">START WITH ONE LINK</p>
          <h2>Make every click count.</h2>
          <p>Shorten a destination. Share it. See the clicks add up.</p>
        </div>
        <button className="button" type="button" onClick={scrollToForm}>Create a link <ArrowRight size={16} /></button>
      </section>

      <footer className="site-footer">
        <div className="section-wrap footer-main">
          <div className="footer-brand">
            <BrandMark />
            <p>Short links, with room to get smarter.</p>
          </div>
          <div className="footer-nav">
            <div><span>PRODUCT</span><a href="#product">Create a link</a><a href="#workspace">Your workspace</a></div>
            <div><span>LEARN</span><a href="#how-it-works">How it works</a><a href="#faq">FAQ</a></div>
          </div>
        </div>
        <div className="section-wrap footer-bottom">
          <span>© 2026 LinkPulse · Prototype</span>
          <a href="#top">Back to top <ArrowUpRight size={13} /></a>
        </div>
      </footer>
    </main>
  )
}
