# Guangxi YanHeng International Trade Co., Ltd. — Import & Export Trading Website

B2B corporate website + product catalog + quotation system + admin dashboard.
Built with Next.js (App Router), TypeScript, Tailwind CSS v4, Prisma ORM and Zod.

Specifications: `PRD.md`, `Architecture.md`, `design.md`, `database_schema.md`.

## Requirements

- Node.js 20+ (24 recommended)
- MySQL 8+ (or PostgreSQL — see below) with a database named `import_export_web`
- npm

## Local setup

```bash
npm install
cp .env.example .env        # then edit DATABASE_URL / NEXT_PUBLIC_SITE_URL

# 1. Create the database
mysql -u root -e "CREATE DATABASE IF NOT EXISTS import_export_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Apply migrations
npx prisma migrate deploy   # or: npm run db:migrate (creates a migration in dev)

# 3. Seed roles, permissions, categories, services, settings, admin user
npm run db:seed
# Optional: ADMIN_SEED_EMAIL=... ADMIN_SEED_PASSWORD=... npm run db:seed

npm run dev                 # http://localhost:3000
```

Sign in at `http://localhost:3000/admin/login` (default seed: `admin@example.com` /
`Admin123!` — change it immediately under Users, or re-seed with
`ADMIN_SEED_PASSWORD`).

## Checks

```bash
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm test            # unit tests (slug, validations, rate limit, password hashing)
npm run build       # production build
```

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Prisma connection string (MySQL or PostgreSQL) |
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical base URL for SEO metadata, sitemap, robots |
| `ADMIN_SEED_EMAIL` | no | Seed admin email (default `admin@example.com`) |
| `ADMIN_SEED_PASSWORD` | no | Seed admin password (default `Admin123!`) |

No other secrets are needed: sessions are DB-backed opaque tokens, password
hashing uses Node `scrypt`. `STORAGE_*` / `EMAIL_*` are reserved for future
object-storage and email phases.

## Database

- Migrations live in `prisma/migrations/` — never edit an applied migration.
- MySQL note: some WAMP installs default to the MyISAM engine, which has no
  foreign keys. Every migration in this repo pins `ENGINE = InnoDB`; if you
  add a migration, do the same (or set `default_storage_engine=InnoDB`).
- To switch to PostgreSQL: change `provider` to `"postgresql"` in
  `prisma/schema.prisma`, set `DATABASE_URL`, then `npx prisma migrate dev`.

## Production deployment

1. Provision Node 20+, MySQL 8+, and HTTPS (required for secure cookies/HSTS).
2. Set `DATABASE_URL` and `NEXT_PUBLIC_SITE_URL=https://your-domain`.
3. `npm ci && npx prisma migrate deploy && npm run db:seed && npm run build`.
4. Start with `npm start` (or a process manager) behind a reverse proxy.
5. `public/uploads/` holds user files — back it up and plan object storage
   (the `media` table already fits an S3 adapter).
6. Post-deploy: sign in, change the admin password, replace placeholder
   company details in `src/config/site.ts` and Settings.

Remaining production notes: rate limiting is in-memory (add Redis past one
instance), and customer attachments in `public/uploads/quotes/` should move to
private storage with signed URLs if document sensitivity grows.
