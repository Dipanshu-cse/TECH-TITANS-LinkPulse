// ─── useLinkManager.js ───────────────────────────────────────────────────────
// Ye hook saari Supabase database logic handle karta hai.
// App.jsx mein yahi sabse complex hissa tha — ab ye yahan alag file mein hai.
//
// Ye hook kya karta hai:
//   1. VISITOR ID generate/retrieve karta hai (localStorage se)
//      Visitor ID se hum identify karte hain kaunsa link is user ka hai
//   2. Links fetch karta hai Supabase se (page load pe)
//   3. Naya link create karne ka function (handleGenerate)
//   4. Link copy karne ka function (copyLink)
//   5. Redirect check karta hai — agar URL mein koi slug hai to redirect karta hai
//
// Return karta hai: saari state + functions jo components ko chahiye

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { supabase } from "../supabase"

export function useLinkManager() {
  // ── Form state ────────────────────────────────────────────────────────────
  const [longUrl, setLongUrl] = useState("")           // user ka input URL
  const [alias, setAlias] = useState("")               // custom alias input
  const [aliasError, setAliasError] = useState("")     // alias error message
  const [passwordProtected, setPasswordProtected] = useState(false)
  const [password, setPassword] = useState("")

  // ── Data state ────────────────────────────────────────────────────────────
  const [links, setLinks] = useState([])               // saare links ka array
  const [loading, setLoading] = useState(true)         // database se data aa raha hai?
  const [generating, setGenerating] = useState(false)  // form submit ho raha hai?
  const [redirecting, setRedirecting] = useState(false) // kya ye page redirect kar raha hai?
  const [copied, setCopied] = useState(null)           // kaunsa URL copy hua hai?
  const [createdModal, setCreatedModal] = useState(null) // created link ka modal data

  // tableRef = links table ka DOM reference (modal ke "view in table" ke liye)
  const tableRef = useRef(null)

  // ── Visitor ID ────────────────────────────────────────────────────────────
  // Visitor ID ek unique identifier hai jo localStorage mein store hota hai.
  // Isse hum pehchante hain ki kaunse links is browser ke hain.
  // useMemo se ye sirf ek baar calculate hoga, har render pe nahi.
  const visitorId = useMemo(() => {
    let id = localStorage.getItem("linkpulse_visitor_id")
    if (!id) {
      // Random ID banao: "usr_" + random string + timestamp
      // eslint-disable-next-line react-hooks/purity
      id = "usr_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
      localStorage.setItem("linkpulse_visitor_id", id)
    }
    return id
  }, [])

  // ── Derived values (calculated values from links array) ───────────────────
  // totalClicks = saare links ke clicks ka sum
  const totalClicks = useMemo(
    () => links.reduce((sum, link) => sum + (Number(link.clicks_count) || 0), 0),
    [links]
  )
  // activeLinksCount = sirf woh links jo disabled nahi hain
  const activeLinksCount = useMemo(
    () => links.filter(link => !link.is_disabled).length,
    [links]
  )

  // ── Redirect check — page load pe ─────────────────────────────────────────
  // Agar URL mein koi slug hai (jaise /abc123) to redirect mode mein jaao
  useEffect(() => {
    // URL se slug nikalo — leading slashes hata do
    const slug = window.location.pathname.replace(/^\/+/, "").trim()

    // Agar slug empty hai to ye homepage hai, redirect nahi karna
    if (!slug) return

    // Redirect mode shuru karo — loading screen dikhao
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRedirecting(true)

    async function processRedirect() {
      // Supabase se us slug ka record dhundo
      const { data, error } = await supabase
        .from("links")
        .select("id, original_url, clicks_count, is_disabled, password_hash")
        .eq("short_code", slug)
        .single()

      // Link nahi mila to homepage pe wapas
      if (error || !data) {
        alert("Link not found or expired.")
        window.location.href = "/"
        return
      }

      // Link disabled hai to homepage pe wapas
      if (data.is_disabled) {
        alert("This link has been disabled.")
        window.location.href = "/"
        return
      }

      // Password check — agar link protected hai to password maango
      const hasPassword = Boolean(data.password_hash && data.password_hash.trim().length > 0)
      if (hasPassword) {
        const enteredPassword = window.prompt("This link is password protected. Enter the access password:")
        if (!enteredPassword || enteredPassword.trim() !== data.password_hash.trim()) {
          alert("Incorrect password or access cancelled.")
          window.location.href = "/"
          return
        }
      }

      // Click count badhao (analytics ke liye)
      await supabase
        .from("links")
        .update({ clicks_count: (data.clicks_count || 0) + 1 })
        .eq("id", data.id)

      // Original URL pe redirect karo
      // Agar URL mein http/https nahi hai to https add karo
      const destination = data.original_url.startsWith("http://") || data.original_url.startsWith("https://")
        ? data.original_url
        : `https://${data.original_url}`

      window.location.href = destination
    }

    processRedirect()
  }, []) // sirf ek baar run karo (page load pe)

  // ── Fetch Links from Supabase ─────────────────────────────────────────────
  const fetchLinks = useCallback(async () => {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("visitor_id", visitorId)     // sirf is user ke links
      .order("created_at", { ascending: false })  // newest pehle

    if (error) {
      console.error("Error fetching links:", error.message)
    } else if (data) {
      setLinks(data)
    }
    setLoading(false)
  }, [visitorId])

  // Page load pe links fetch karo
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchLinks() }, [fetchLinks])

  // ── Handle Generate — naya link create karna ─────────────────────────────
  const handleGenerate = async (event) => {
    event.preventDefault()  // form ka default submit behavior rokna
    setAliasError("")        // pichla error clear karo

    if (!longUrl.trim()) return

    // Password check — agar password protect checked hai to password zaroor chahiye
    if (passwordProtected && !password.trim()) {
      alert("Please enter a protection password or uncheck the password option.")
      return
    }

    setGenerating(true)

    // Slug determine karo: custom alias use karo ya random generate karo
    const slug = alias.trim()
      ? alias.trim().replace(/\s+/g, "").toLowerCase()  // spaces hata ke lowercase
      : Math.random().toString(36).substring(2, 8)       // random 6 char slug

    const isProtected = Boolean(passwordProtected && password.trim().length > 0)

    // Database mein insert karne ka data
    const newRecord = {
      original_url: longUrl.trim(),
      short_code: slug,
      clicks_count: 0,
      is_disabled: false,
      visitor_id: visitorId,
      password_hash: isProtected ? password.trim() : null,  // password ya null
    }

    const { data, error } = await supabase.from("links").insert([newRecord]).select()
    setGenerating(false)

    if (error) {
      // Error code 23505 = unique constraint violation = alias already taken
      if (error.code === "23505") {
        setAliasError(`Alias "${slug}" is already taken. Try another alias.`)
      } else {
        setAliasError("Unable to save link right now. Please try again.")
        console.error("Insert error:", error)
      }
      return
    }

    if (data && data.length > 0) {
      const createdLink = data[0]

      // Naya link ko list ke upar add karo (local state update)
      setLinks(prev => [createdLink, ...prev])

      // Form fields clear karo
      setLongUrl("")
      setAlias("")
      setPassword("")
      setPasswordProtected(false)

      // Success modal dikhao
      setCreatedModal({
        workingUrl: `${window.location.origin}/${createdLink.short_code}`,
        displayUrl: `go.linkpulse.io/${createdLink.short_code}`,
        originalUrl: createdLink.original_url,
        isProtected: Boolean(createdLink.password_hash),
      })
    }
  }

  // ── Copy Link ─────────────────────────────────────────────────────────────
  // Link clipboard mein copy karo, phir 1.6 sec baad "copied" state clear karo
  const copyLink = async (textToCopy) => {
    await navigator.clipboard?.writeText(textToCopy)
    setCopied(textToCopy)
    setTimeout(() => setCopied(null), 1600)
  }

  // ── Modal handlers ────────────────────────────────────────────────────────
  const closeModal = () => setCreatedModal(null)

  const viewInTable = () => {
    setCreatedModal(null)
    // Smooth scroll table tak
    tableRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Saari state aur functions return karo jo components ko chahiye
  return {
    // Form state
    longUrl, setLongUrl,
    alias, setAlias,
    aliasError, setAliasError,
    passwordProtected, setPasswordProtected,
    password, setPassword,
    // Data state
    links,
    loading,
    generating,
    redirecting,
    copied,
    createdModal,
    // Computed values
    totalClicks,
    activeLinksCount,
    // Refs
    tableRef,
    // Functions
    handleGenerate,
    copyLink,
    closeModal,
    viewInTable,
  }
}
