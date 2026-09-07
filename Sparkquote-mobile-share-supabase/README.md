# SparkQuote

## Share a complete quote from a phone

The **Share complete quote** button saves an immutable quote snapshot and opens the phone's native share sheet. The recipient receives a normal web link and can view every cost line on any phone; exporting a PDF is optional.

### One-time free setup: Supabase + Vercel

1. Create a free Supabase project at [supabase.com](https://supabase.com), then open **SQL Editor** and run [`supabase/schema.sql`](./supabase/schema.sql).
2. In Supabase **Project Settings → API**, copy the project URL and the **service_role** secret. Keep that secret private.
3. Import this GitHub repository into Vercel. In **Settings → Environment Variables**, add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for Production, Preview and Development.
4. Deploy. Your Vercel URL is now the permanent base for shared quote links.

The browser never receives the service-role key. The database has Row Level Security enabled, while the Vercel API reads a quote only when the visitor has its random share token.

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-nkg1pnpv)
