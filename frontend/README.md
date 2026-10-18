# LinkPulse

LinkPulse is a client-side URL shortener built with React, Vite, and Supabase.
It supports custom aliases, password protection, expiry dates, click limits,
device-aware click tracking, and a seven-day analytics view.

## Development

```bash
npm install
npm run dev
```

The production checks are:

```bash
npm run lint
npm run build
```

## Supabase setup

1. Create the `links` and `clicks` tables expected by
   [`useLinkManager.js`](./src/hooks/useLinkManager.js).
2. Run [`supabase_migration.sql`](../supabase_migration.sql) in the Supabase SQL
   editor.
3. Configure Row Level Security policies for the anonymous client before
   deploying. Redirect lookups need public read access to the minimum link
   fields, while link-management queries must be restricted to the owner
   identity used by the application.

Passwords created by the current client are stored as SHA-256 hashes in
`password_hash`; never store or migrate plaintext passwords into that column.
Existing plaintext records must be recreated or migrated securely before
enabling password-protected links.

## Important limitation

The current anonymous-browser workspace is tied to a browser-local visitor ID.
It is not an authenticated account, so links are not automatically available
on another device or browser.
