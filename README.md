# Alam Jastip — Last-Mile Delivery Management

Mobile-first web app for managing jastip (last-mile delivery) packages. Built with React, Vite, Tailwind CSS, and Lovable Cloud.

## Features

- Dashboard with live Pending / Picked Up / Profit counters
- Barcode scanner for quick resi input
- Quick-action status buttons (Ambil Paket → Selesai)
- Expedition & status filters for warehouse workflows
- Full CRUD with real-time database

## Development

```bash
npm install
npm run dev
```

## Deploying to Vercel

### Option A — GitHub Integration (recommended)

1. Connect this project to GitHub via Lovable (Settings → GitHub).
2. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo.
3. Vercel auto-detects Vite. No config changes needed.
4. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
5. Click **Deploy**.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel          # follow prompts, select defaults
```

Set env vars with `vercel env add VITE_SUPABASE_URL` etc.

### Notes

- Build command: `npm run build` (outputs to `dist/`)
- Framework preset: **Vite**
- Backend (database, edge functions) runs on Lovable Cloud and is independent of frontend hosting.
