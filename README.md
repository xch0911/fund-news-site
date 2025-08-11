# Fund News Site - Prototype

This is a Next.js + Prisma prototype for a fund news website with an admin backend.

## Quick start (local)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate Prisma client and run migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

3. Seed the DB:
   ```bash
   node prisma/seed.js
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

Open http://localhost:3000

Default seeded admin user: `admin` / `admin`

## Notes

- Replace `DATABASE_URL` and `JWT_SECRET` in `.env` before deploying.
- For production on Vercel, use a managed database (Supabase, PlanetScale, Railway) instead of SQLite.
