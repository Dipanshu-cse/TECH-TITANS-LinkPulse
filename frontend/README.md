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

1. Run [`supabase_migration.sql`](../supabase_migration.sql) in the Supabase SQL
   editor. It creates missing `links` and `clicks` tables, adds the required
   columns and indexes, enables RLS, and installs the policies used by the
   anonymous client.
2. If the tables already exist, the migration is safe to run again: columns,
   indexes, and policies are installed idempotently.

Passwords created by the current client are stored as SHA-256 hashes in
`password_hash`; never store or migrate plaintext passwords into that column.
Existing plaintext records must be recreated or migrated securely before
enabling password-protected links.

## Important limitation

The current anonymous-browser workspace is tied to a browser-local visitor ID.
It is not an authenticated account, so links are not automatically available
on another device or browser. The migration's permissive policies are intended
for this demo/no-account model; add Supabase Auth or a server-side API before
using it for private production data.
