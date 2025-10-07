# Trip Manager (Vite + React + Supabase + PWA)

A free-tier friendly mobile-first app to track **Expenses & Debts**, **Itinerary**, and **Important Links**.

## 0) What you'll get
- Magic-link sign-in (Supabase Auth)
- Expenses in ILS/USD/EUR/THB with **live conversion to ILS**
- Net debt banner: "who owes whom how much"
- Itinerary with **Next Up** logic (closest future item)
- Links store (Flights/Hotels/Other)
- Installable on iPhone as a **PWA**
- Works for 1–3 users on free tiers

## 1) Create free back-end (Supabase)
1. Go to https://supabase.com/ and create a free project.
2. Copy **Project URL** and **anon key** to your `.env` (next section).
3. In *Auth → Providers*, enable **Email** (magic links).
4. In *SQL Editor*, run the SQL from `supabase_schema.sql` in this repo.
5. (Optional) In *Authentication → Policies*, confirm RLS is enabled (it is in the script).

## 2) Local setup
```bash
npm i
cp .env.example .env
# then edit .env with your values
npm run dev
```
Open http://localhost:5173

## 3) Deploy free (Netlify or Cloudflare Pages)
### Netlify
- New site from Git (or drag-and-drop build): `npm run build` with **Build Command** `npm run build` and **Publish directory** `dist/`.
- Add environment variables in Netlify **Site settings → Environment** from `.env`.
- After deploy, visit the URL on iPhone → Share → **Add to Home Screen**.

### Cloudflare Pages
- Create a Pages project from your Git.
- Build command: `npm run build`; Output dir: `dist`.
- Add the environment variables.

Vercel also works. Use the same build settings.

## 4) Environment
Create `.env`:
```
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## 5) Demo Data
Open Supabase **SQL editor** and run `demo_data.sql` to insert example users, expenses, itinerary and links.

---

## Notes
- Exchange rates from https://api.exchangerate.host (free) — no key required.
- This client app uses RLS-secured tables; each row includes `user_id` filled by Supabase (via the `auth.uid()` default).
- For MVP, parties "A" and "B" are your two travelers (e.g., Noam=A, Doron=B). You can later generalize to arbitrary groups.
