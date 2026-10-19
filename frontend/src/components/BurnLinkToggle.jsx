export default function BurnLinkToggle({ isBurnEnabled, setIsBurnEnabled }) {
  return (
    <div
      className="flex items-start gap-3 rounded-2xl border p-4"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <input
        type="checkbox"
        id="burn-link-toggle"
        checked={isBurnEnabled}
        onChange={(e) => setIsBurnEnabled(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0"
        style={{ accentColor: "var(--text-accent)" }}
      />
      <div>
        <label
          htmlFor="burn-link-toggle"
          className="cursor-pointer text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          One-time link
        </label>
        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
          Allow one verified click, then block future redirects.
        </p>
      </div>
    </div>
  );
}
