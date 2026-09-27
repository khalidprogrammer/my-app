# Architecture.md — Dynamic Import & Export Website

## 1. Architecture Overview

The system follows a modular full-stack Next.js architecture.

```text
Browser
   |
   v
Next.js App Router
   |
   +--------------------+
   |                    |
   v                    v
Public Website       Admin Dashboard
   |                    |
   +---------+----------+
             |
             v
       Application Layer
             |
       +-----+------+
       |            |
       v            v
   Database      File Storage
       |
       v
 PostgreSQL/MySQL
```

Recommended stack:

- Next.js
- TypeScript
- App Router
- Tailwind CSS
- shadcn/ui
- PostgreSQL or MySQL
- Prisma ORM
- Zod
- React Hook Form
- Auth.js or equivalent authentication
- Cloud/S3-compatible object storage for media

---

## 2. Application Structure

```text
src/
├── app/
│   ├── (website)/
│   │   ├── page.tsx
│   │   ├── about/
│   │   ├── products/
│   │   ├── services/
│   │   ├── markets/
│   │   ├── news/
│   │   ├── contact/
│   │   └── quote/
│   │
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── products/
│   │   ├── categories/
│   │   ├── services/
│   │   ├── markets/
│   │   ├── quotes/
│   │   ├── contacts/
│   │   ├── news/
│   │   ├── media/
│   │   ├── settings/
│   │   └── users/
│   │
│   ├── api/
│   │   ├── products/
│   │   ├── quotes/
│   │   ├── contacts/
│   │   └── uploads/
│   │
│   ├── sitemap.ts
│   ├── robots.ts
│   └── layout.tsx
│
├── components/
│   ├── ui/
│   ├── website/
│   ├── products/
│   ├── services/
│   ├── admin/
│   └── forms/
│
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   ├── validations/
│   ├── services/
│   ├── permissions/
│   ├── seo/
│   └── utils.ts
│
├── actions/
│   ├── products.ts
│   ├── categories.ts
│   ├── quotes.ts
│   ├── services.ts
│   └── settings.ts
│
├── types/
│
└── config/
```

---

## 3. Routing

### Public Routes

```text
/
/about
/products
/products/[slug]
/categories/[slug]
/services
/services/[slug]
/markets
/markets/[slug]
/news
/news/[slug]
/contact
/quote
```

### Admin Routes

```text
/admin
/admin/products
/admin/products/new
/admin/products/[id]
/admin/categories
/admin/services
/admin/markets
/admin/quotes
/admin/quotes/[id]
/admin/news
/admin/media
/admin/settings
/admin/users
```

---

## 4. Rendering Strategy

### Static / Cached
Use cached/server-rendered pages for:
- About
- Services
- Categories
- Public product pages
- Markets
- Articles

### Dynamic
Use dynamic rendering for:
- Admin dashboard
- Quote management
- Contact messages
- Authenticated pages

### Revalidation

After admin content changes, invalidate the relevant cache/path.

Example:

```text
Update Product
     |
     v
Database
     |
     v
revalidatePath()
     |
     v
Updated public product page
```

---

## 5. Data Flow

### Product

```text
Admin
  |
  v
Product Form
  |
  v
Zod Validation
  |
  v
Server Action/API
  |
  v
Prisma
  |
  v
Database
  |
  v
Cache Revalidation
```

### Quote Request

```text
Customer
  |
  v
Quote Form
  |
  v
Validation
  |
  v
Rate Limit
  |
  v
Quote Service
  |
  v
Database
  |
  v
Admin Notification
```

---

## 6. Authentication

Admin authentication should support:
- Email/password
- Secure password hashing
- Session management
- Role-based permissions

Roles:

```text
SUPER_ADMIN
CONTENT_MANAGER
PRODUCT_MANAGER
SALES_MANAGER
INQUIRY_MANAGER
```

Example permission model:

```text
products.view
products.create
products.update
products.delete
quotes.view
quotes.update
services.manage
news.manage
settings.manage
users.manage
```

---

## 7. API / Server Action Design

Prefer Server Actions for internal admin mutations where appropriate.

Use Route Handlers for:
- Public form endpoints when required
- Webhooks
- External integrations
- File upload endpoints
- Public APIs

All input should be validated with Zod.

---

## 8. Media Architecture

Images should not be stored directly in the database.

Database stores:
- File name
- URL/key
- MIME type
- Size
- Alt text
- Width
- Height

Storage:
- S3-compatible storage
- Cloudinary
- Other managed object storage

---

## 9. Search

MVP:
- Product name
- SKU
- Category
- Description

Use indexed database queries.

Future:
- Full-text search
- Elasticsearch/OpenSearch
- Product filters
- Faceted search

---

## 10. Security Architecture

Apply:
- Authentication
- Authorization
- Server-side validation
- Rate limiting
- File type validation
- File size limits
- Secure headers
- SQL injection protection through ORM
- XSS-safe rendering
- Audit logs
- Environment secrets

Never expose:
- Database credentials
- Private storage credentials
- Authentication secrets
- Internal API keys

---

## 11. Deployment

Recommended production setup:

```text
Git Repository
      |
      v
CI/CD
      |
      v
Next.js Application
      |
      +---- Database
      |
      +---- Object Storage
      |
      +---- Email Provider
```

Environment variables:

```text
DATABASE_URL=
AUTH_SECRET=
STORAGE_ENDPOINT=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_BUCKET=
NEXT_PUBLIC_SITE_URL=
EMAIL_SERVER=
```

---

## 12. Scalability

The initial architecture should support:
- More product categories
- More products
- Multiple administrators
- Multiple markets
- Multiple languages
- Customer accounts
- Supplier accounts
- CRM integrations
- ERP integrations
- Online ordering

without restructuring the core database.
