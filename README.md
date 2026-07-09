# DermaTriage

Mobile-first skin triage app built for the Cursor iOS London Hackathon.

## What it does
- Take a photo of a skin concern using your iPhone camera.
- Get a cautious, AI-powered triage summary with observed concerns, recommendations, and an urgency level.
- Built entirely as a web app so it works smoothly inside Cursor iOS + Vercel.

## Stack
- Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- OpenAI GPT-4o-mini for vision analysis
- Supabase (optional) for auth, database, and image storage
- Vercel for hosting and preview deployments

## Local development

```bash
npm install
# copy env vars and fill them in
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone or browser.

## Required environment variables

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Powers the `/api/analyze` vision endpoint |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional Supabase anon key |

## Deployment

1. Push this repo to GitHub.
2. Import it on [Vercel](https://vercel.com).
3. Add `OPENAI_API_KEY` in Vercel project settings.
4. Enable Preview Deployments and disable Preview Deployment Authentication so judges can open preview URLs without signing in.

## Important note
DermaTriage is **not a medical diagnosis tool**. Always consult a dermatologist or GP for professional advice.
