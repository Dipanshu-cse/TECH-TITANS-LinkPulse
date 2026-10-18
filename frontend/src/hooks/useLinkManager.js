// ─── useLinkManager.js ───────────────────────────────────────────────────────
// Ye hook saari Supabase database logic handle karta hai.
// App.jsx mein yahi sabse complex hissa tha — ab ye yahan alag file mein hai.
//
// Schema (links table):
//   id, created_at, original_url, short_code, campaign, click_limit,
//   clicks_count, expires_at, is_disabled, visitor_id*, password_hash*
//   (* added via supabase_migration.sql)
//
// Schema (clicks table):
//   id, created_at, link_id, ip_address, user_agent, device_type, country
//
// Ye hook kya karta hai:
//   1. VISITOR ID generate/retrieve karta hai (localStorage se)
//   2. Links fetch karta hai Supabase se (sirf is visitor ke)
//   3. Naya link create karne ka function (handleGenerate)
//   4. Link copy / disable / delete functions
//   5. Redirect check — agar URL mein koi slug hai to redirect karta hai
//      + clicks table mein analytics row insert karta hai

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { supabase } from "../supabase"

export function useLinkManager() {
  // ── Form state ────────────────────────────────────────────────────────────
  const [longUrl, setLongUrl] = useState("")
  const [alias, setAlias] = useState("")
  const [aliasError, setAliasError] = useState("")
  const [passwordProtected, setPasswordProtected] = useState(false)
  const [password, setPassword] = useState("")
  const [expiresAt, setExpiresAt] = useState("")      // ISO date string or ""
  const [clickLimit, setClickLimit] = useState("")    // numeric string or ""

  // ── Data state ────────────────────────────────────────────────────────────
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [copied, setCopied] = useState(null)
  const [createdModal, setCreatedModal] = useState(null)

  // tableRef = links table DOM reference (modal "view in table" button ke liye)
  const tableRef = useRef(null)

  // ── Visitor ID ────────────────────────────────────────────────────────────
  // localStorage mein store hone wala unique browser ID.
  // visitor_id column migration se add hua hai (supabase_migration.sql).
  // useRef se ye sirf mount pe once run hoga — useMemo ke andar impure calls
  // (Math.random, Date.now) ESLint rule react-hooks/purity violate karte hain,
  // isliye ye logic ref mein move kiya.
  const visitorIdRef = useRef(null)
  if (visitorIdRef.current === null) {
    let id = localStorage.getItem("linkpulse_visitor_id")
    if (!id) {
      // eslint-disable-next-line react-hooks/purity
      id = "usr_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
      localStorage.setItem("linkpulse_visitor_id", id)
    }
    visitorIdRef.current = id
  }
  const visitorId = visitorIdRef.current

  // ── Derived values ────────────────────────────────────────────────────────
  const totalClicks = useMemo(
    () => links.reduce((sum, link) => sum + (Number(link.clicks_count) || 0), 0),
    [links]
  )
  const activeLinksCount = useMemo(
    () => links.filter(link => !link.is_disabled).length,
    [links]
  )

  // ── Redirect check — page load pe ─────────────────────────────────────────
  // Agar URL mein koi slug hai (jaise /abc123) to redirect mode mein jaao.
  // Analytics ke liye clicks table mein ek row bhi insert karo.
  useEffect(() => {
    const slug = window.location.pathname.replace(/^\/+/, "").trim()
    if (!slug) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRedirecting(true)

    async function processRedirect() {
      // Slug se link dhundo
      const { data, error } = await supabase
        .from("links")
        .select("id, original_url, clicks_count, is_disabled, password_hash, expires_at, click_limit")
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

      // Expiry check
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        alert("This link has expired.")
        window.location.href = "/"
        return
      }

      // Click limit check
      if (data.click_limit !== null && data.click_limit !== undefined) {
        if ((data.clicks_count || 0) >= data.click_limit) {
          alert("This link has reached its maximum click limit.")
          window.location.href = "/"
          return
        }
      }

      // Password check — agar password_hash column exist karta hai aur value hai
      const hasPassword = Boolean(data.password_hash && data.password_hash.trim().length > 0)
      if (hasPassword) {
        const entered = window.prompt("This link is password protected. Enter the access password:")
        if (!entered || entered.trim() !== data.password_hash.trim()) {
          alert("Incorrect password or access cancelled.")
          window.location.href = "/"
          return
        }
      }

      // Analytics: clicks table mein row insert karo (device_type, user_agent capture)
      const ua = navigator.userAgent
      const deviceType = /Mobi|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop"
      await supabase.from("clicks").insert([{
        link_id: data.id,
        user_agent: ua.substring(0, 255), // truncate agar bahut lamba ho
        device_type: deviceType,
      }])

      // clicks_count bhi update karo (denormalized counter — fast reads ke liye)
      await supabase
        .from("links")
        .update({ clicks_count: (data.clicks_count || 0) + 1 })
        .eq("id", data.id)

      // Destination pe redirect karo
      const destination =
        data.original_url.startsWith("http://") || data.original_url.startsWith("https://")
          ? data.original_url
          : `https://${data.original_url}`

      window.location.href = destination
    }

    processRedirect()
  }, [])

  // ── Fetch Links from Supabase ─────────────────────────────────────────────
  // Sirf is visitor ke links fetch karo, newest pehle
  const fetchLinks = useCallback(async () => {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("visitor_id", visitorId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching links:", error.message)
    } else if (data) {
      setLinks(data)
    }
    setLoading(false)
  }, [visitorId])

  useEffect(() => { fetchLinks() }, [fetchLinks])

  // ── Handle Generate — naya link create karna ─────────────────────────────
  const handleGenerate = async (event) => {
    event.preventDefault()
    setAliasError("")

    if (!longUrl.trim()) return

    if (passwordProtected && !password.trim()) {
      alert("Please enter a protection password or uncheck the password option.")
      return
    }

    setGenerating(true)

    // Custom alias ya random 6-char slug
    const slug = alias.trim()
      ? alias.trim().replace(/\s+/g, "").toLowerCase()
      : Math.random().toString(36).substring(2, 8)

    const isProtected = Boolean(passwordProtected && password.trim().length > 0)

    const newRecord = {
      original_url: longUrl.trim(),
      short_code: slug,
      clicks_count: 0,
      is_disabled: false,
      visitor_id: visitorId,
      password_hash: isProtected ? password.trim() : null,
      expires_at: expiresAt.trim() ? new Date(expiresAt.trim()).toISOString() : null,
      click_limit: clickLimit.trim() ? parseInt(clickLimit.trim(), 10) : null,
    }

    const { data, error } = await supabase.from("links").insert([newRecord]).select()
    setGenerating(false)

    if (error) {
      // 23505 = unique constraint violation = alias already taken
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

      setLinks(prev => [createdLink, ...prev])

      // Form clear karo
      setLongUrl("")
      setAlias("")
      setPassword("")
      setPasswordProtected(false)
      setExpiresAt("")
      setClickLimit("")

      // Success modal dikhao
      setCreatedModal({
        workingUrl: `${window.location.origin}/${createdLink.short_code}`,
        displayUrl: `linkpulse.io/${createdLink.short_code}`,
        originalUrl: createdLink.original_url,
        isProtected: Boolean(createdLink.password_hash),
      })
    }
  }

  // ── Copy Link ─────────────────────────────────────────────────────────────
  const copyLink = async (textToCopy) => {
    await navigator.clipboard?.writeText(textToCopy)
    setCopied(textToCopy)
    setTimeout(() => setCopied(null), 1600)
  }

  // ── Toggle Disable ────────────────────────────────────────────────────────
  // Link ko enable/disable karo — visitor_id filter security ke liye
  const toggleDisable = async (linkId, currentDisabledState) => {
    const { error } = await supabase
      .from("links")
      .update({ is_disabled: !currentDisabledState })
      .eq("id", linkId)
      .eq("visitor_id", visitorId)

    if (!error) {
      setLinks(prev =>
        prev.map(link =>
          link.id === linkId ? { ...link, is_disabled: !currentDisabledState } : link
        )
      )
    } else {
      console.error("Toggle disable error:", error.message)
    }
  }

  // ── Delete Link ───────────────────────────────────────────────────────────
  const deleteLink = async (linkId) => {
    const { error } = await supabase
      .from("links")
      .delete()
      .eq("id", linkId)
      .eq("visitor_id", visitorId)

    if (!error) {
      setLinks(prev => prev.filter(link => link.id !== linkId))
    } else {
      console.error("Delete error:", error.message)
    }
  }

  // ── Modal handlers ────────────────────────────────────────────────────────
  const closeModal = () => setCreatedModal(null)

  const viewInTable = () => {
    setCreatedModal(null)
    tableRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return {
    // Form state
    longUrl, setLongUrl,
    alias, setAlias,
    aliasError, setAliasError,
    passwordProtected, setPasswordProtected,
    password, setPassword,
    expiresAt, setExpiresAt,
    clickLimit, setClickLimit,
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
    toggleDisable,
    deleteLink,
    closeModal,
    viewInTable,
  }
}
