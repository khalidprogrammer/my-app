// Phase 1 seed: roles, permissions (+ mapping), categories, services.
// Phase 4 additions: default site settings, homepage sections, initial admin.
// Idempotent: safe to re-run (`upsert` everywhere; admin password only set
// on first creation unless ADMIN_SEED_PASSWORD is provided).
//
// Run:  npx prisma db seed   (wired via package.json `prisma.seed`)
//       or: npx tsx prisma/seed.ts
//
// Env:  ADMIN_SEED_EMAIL (default admin@example.com)
//       ADMIN_SEED_PASSWORD (default Admin123! — change immediately after login)

import { PrismaClient } from "@prisma/client";
import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

const prisma = new PrismaClient();

const ROLES: { name: string; description: string }[] = [
  { name: "SUPER_ADMIN", description: "Full access to all modules and settings." },
  { name: "CONTENT_MANAGER", description: "Manages services, markets, news, homepage and media." },
  { name: "PRODUCT_MANAGER", description: "Manages products, categories and product media." },
  { name: "SALES_MANAGER", description: "Handles quotes, contacts and product visibility." },
  { name: "INQUIRY_MANAGER", description: "Handles quote and contact inquiries." },
];

const PERMISSIONS: { name: string; description: string }[] = [
  // Spec example (database_schema.md §6 / Architecture.md §6)
  { name: "products.view", description: "View products." },
  { name: "products.create", description: "Create products." },
  { name: "products.update", description: "Update products." },
  { name: "products.delete", description: "Delete/archive products." },
  { name: "quotes.view", description: "View quote inquiries." },
  { name: "quotes.update", description: "Update quote status and assignment." },
  { name: "services.manage", description: "Manage services." },
  { name: "news.manage", description: "Manage news categories and articles." },
  { name: "settings.manage", description: "Manage site settings and homepage." },
  { name: "users.manage", description: "Manage admin users, roles and permissions." },
  // Extensions required by the rest of the spec surface
  { name: "dashboard.view", description: "View admin dashboard statistics." },
  { name: "categories.manage", description: "Manage product categories." },
  { name: "markets.manage", description: "Manage markets." },
  { name: "quotes.create", description: "Create quotes on behalf of customers." },
  { name: "quotes.delete", description: "Delete/archive quotes." },
  { name: "contacts.view", description: "View contact messages." },
  { name: "contacts.update", description: "Update contact status and assignment." },
  { name: "contacts.delete", description: "Delete/archive contact messages." },
  { name: "media.view", description: "View media library." },
  { name: "media.create", description: "Upload media." },
  { name: "media.delete", description: "Delete media." },
  { name: "gallery.manage", description: "Manage gallery albums and photos." },
  { name: "homepage.manage", description: "Manage homepage sections." },
  { name: "audit.view", description: "View audit logs." },
];

// "*" grants every permission.
const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ["*"],
  PRODUCT_MANAGER: [
    "dashboard.view",
    "products.view",
    "products.create",
    "products.update",
    "products.delete",
    "categories.manage",
    "gallery.manage",
    "media.view",
    "media.create",
  ],
  CONTENT_MANAGER: [
    "dashboard.view",
    "services.manage",
    "markets.manage",
    "news.manage",
    "homepage.manage",
    "gallery.manage",
    "media.view",
    "media.create",
  ],
  SALES_MANAGER: [
    "dashboard.view",
    "products.view",
    "quotes.view",
    "quotes.create",
    "quotes.update",
    "contacts.view",
    "contacts.update",
    "media.view",
  ],
  INQUIRY_MANAGER: ["dashboard.view", "quotes.view", "quotes.update", "contacts.view", "contacts.update"],
};

// PRD §7 canonical list (13). Note: database_schema.md §26 lists 12 and omits
// "Technology Services"; the PRD list wins here and is recorded in the plan.
const CATEGORIES: { name: string; slug: string }[] = [
  { name: "Auto Parts", slug: "auto-parts" },
  { name: "Hardware Products", slug: "hardware-products" },
  { name: "Machinery & Equipment", slug: "machinery-equipment" },
  { name: "Machinery Parts & Components", slug: "machinery-parts-components" },
  { name: "Electronic Products", slug: "electronic-products" },
  { name: "Building Materials", slug: "building-materials" },
  { name: "Plastic Products", slug: "plastic-products" },
  { name: "Office Supplies", slug: "office-supplies" },
  { name: "Daily Necessities", slug: "daily-necessities" },
  { name: "Mechanical & Electrical Equipment", slug: "mechanical-electrical-equipment" },
  { name: "Power Facility Equipment & Materials", slug: "power-facility-equipment-materials" },
  { name: "Prepackaged Food", slug: "prepackaged-food" },
  { name: "Technology Services", slug: "technology-services" },
];

// database_schema.md §26 seed (15 — superset of the 10 core pages in PRD §5.4).
const SERVICES: { name: string; slug: string }[] = [
  { name: "Import & Export", slug: "import-export" },
  { name: "Import & Export Agency", slug: "import-export-agency" },
  { name: "Domestic Trade Agency", slug: "domestic-trade-agency" },
  { name: "Supply Chain Management", slug: "supply-chain-management" },
  { name: "Freight Forwarding", slug: "freight-forwarding" },
  { name: "Loading & Unloading", slug: "loading-unloading" },
  { name: "Technical Services", slug: "technical-services" },
  { name: "Technology Development", slug: "technology-development" },
  { name: "Technology Consultation", slug: "technology-consultation" },
  { name: "Technology Transfer", slug: "technology-transfer" },
  { name: "Technology Promotion", slug: "technology-promotion" },
  { name: "Information Technology Consulting", slug: "information-technology-consulting" },
  { name: "Translation Services", slug: "translation-services" },
  { name: "Marketing Planning", slug: "marketing-planning" },
  { name: "Advertising Design & Agency", slug: "advertising-design-agency" },
];

async function main() {
  // --- Roles ---
  for (const r of ROLES) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r,
    });
  }

  // --- Permissions ---
  for (const p of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: p.name },
      update: { description: p.description },
      create: p,
    });
  }

  // --- Role ↔ permission mapping ---
  const [roles, permissions] = await Promise.all([
    prisma.role.findMany(),
    prisma.permission.findMany(),
  ]);
  const roleId = new Map(roles.map((r) => [r.name, r.id]));
  const permId = new Map(permissions.map((p) => [p.name, p.id]));

  for (const [roleName, perms] of Object.entries(ROLE_PERMISSIONS)) {
    const rid = roleId.get(roleName);
    if (!rid) throw new Error(`seed: missing role ${roleName}`);
    const names = perms.includes("*") ? [...permId.keys()] : perms;
    for (const name of names) {
      const pid = permId.get(name);
      if (!pid) throw new Error(`seed: missing permission ${name}`);
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: rid, permissionId: pid } },
        update: {},
        create: { roleId: rid, permissionId: pid },
      });
    }
  }

  // --- Categories ---
  let order = 1;
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, sortOrder: order, status: "ACTIVE" },
      create: { name: c.name, slug: c.slug, sortOrder: order, status: "ACTIVE" },
    });
    order += 1;
  }

  // --- Services (published so future public pages can render immediately) ---
  order = 1;
  for (const s of SERVICES) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: { name: s.name, sortOrder: order, status: "PUBLISHED" },
      create: {
        name: s.name,
        slug: s.slug,
        shortDescription: s.name,
        sortOrder: order,
        status: "PUBLISHED",
      },
    });
    order += 1;
  }

  // --- Default site settings (database_schema.md §21 keys) ---
  const SETTINGS: { key: string; value: string; type: "STRING" | "TEXT" }[] = [
    { key: "site_name", value: "Guangxi YanHeng International Trade Co., Ltd.", type: "STRING" },
    { key: "company_email", value: "info@example.com", type: "STRING" },
    { key: "company_phone", value: "+86 000 0000 0000", type: "STRING" },
    { key: "company_address", value: "Your business address here", type: "STRING" },
    { key: "company_description", value: "Dependable international trade solutions for buyers worldwide.", type: "TEXT" },
    { key: "whatsapp_number", value: "", type: "STRING" },
    { key: "facebook_url", value: "", type: "STRING" },
    { key: "linkedin_url", value: "", type: "STRING" },
    { key: "instagram_url", value: "", type: "STRING" },
    { key: "default_seo_title", value: "Guangxi YanHeng International Trade Co., Ltd. — Global Trade & Sourcing", type: "STRING" },
    { key: "default_seo_description", value: "Import and export of industrial products, machinery, electronics and building materials.", type: "TEXT" },
  ];
  for (const s of SETTINGS) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: { key: s.key, value: s.value, type: s.type },
    });
  }

  // --- Homepage sections (database_schema.md §22 keys) ---
  const SECTIONS: { sectionKey: string; title: string; sortOrder: number }[] = [
    { sectionKey: "hero", title: "Hero", sortOrder: 1 },
    { sectionKey: "business_categories", title: "Business Categories", sortOrder: 2 },
    { sectionKey: "featured_products", title: "Featured Products", sortOrder: 3 },
    { sectionKey: "services", title: "Services", sortOrder: 4 },
    { sectionKey: "markets", title: "Markets", sortOrder: 5 },
    { sectionKey: "statistics", title: "Statistics", sortOrder: 6 },
    { sectionKey: "why_choose_us", title: "Why Choose Us", sortOrder: 7 },
    { sectionKey: "news", title: "News", sortOrder: 8 },
    { sectionKey: "cta", title: "Call To Action", sortOrder: 9 },
  ];
  for (const s of SECTIONS) {
    await prisma.homepageSection.upsert({
      where: { sectionKey: s.sectionKey },
      update: {},
      create: { sectionKey: s.sectionKey, title: s.title, sortOrder: s.sortOrder, status: "ACTIVE" },
    });
  }

  // --- Initial super-admin (created once; password from env on re-runs only if set) ---
  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "Admin123!";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: { name: "Administrator", email: adminEmail, passwordHash: await hashPassword(adminPassword), status: "ACTIVE" },
    });
    const superAdmin = await prisma.role.findUniqueOrThrow({ where: { name: "SUPER_ADMIN" } });
    await prisma.userRole.create({ data: { userId: admin.id, roleId: superAdmin.id } });
    console.log(`seed: created super-admin ${adminEmail} (change the password after first login)`);
  } else if (process.env.ADMIN_SEED_PASSWORD) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { passwordHash: await hashPassword(adminPassword), status: "ACTIVE" },
    });
    console.log(`seed: reset password for ${adminEmail}`);
  }

  // --- Gallery: starter album with the site's own imagery ---
  // Registers the local public/images photos as media rows so the public
  // gallery is meaningful from the first run. Fully manageable in admin.
  const SITE_PHOTOS = [
    { file: "hero-logistics-bg.jpg", alt: "Container terminal at dusk", caption: "Container terminal operations" },
    { file: "hero-port.jpg", alt: "Container ship at a cargo port", caption: "Ocean freight and port handling" },
    { file: "hero-warehouse.jpg", alt: "Warehouse shelves stocked with goods", caption: "Consolidation and warehousing" },
    { file: "hero-containers.jpg", alt: "Cargo containers stacked at a port terminal", caption: "Container loading for export" },
  ];
  const album = await prisma.galleryAlbum.upsert({
    where: { slug: "operations" },
    update: { name: "Operations", status: "ACTIVE" },
    create: {
      name: "Operations",
      slug: "operations",
      description: "Sourcing, warehousing and shipping snapshots.",
      sortOrder: 1,
      status: "ACTIVE",
    },
  });
  let photoOrder = 0;
  for (const photo of SITE_PHOTOS) {
    const media = await prisma.media.upsert({
      where: { storageKey: `images/${photo.file}` },
      update: { altText: photo.alt },
      create: {
        fileName: photo.file,
        storageKey: `images/${photo.file}`,
        url: `/images/${photo.file}`,
        mimeType: "image/jpeg",
        fileSize: 0,
        altText: photo.alt,
      },
    });
    const existing = await prisma.galleryItem.findFirst({
      where: { albumId: album.id, mediaId: media.id },
      select: { id: true },
    });
    if (!existing) {
      await prisma.galleryItem.create({
        data: { albumId: album.id, mediaId: media.id, caption: photo.caption, sortOrder: photoOrder },
      });
    }
    photoOrder += 1;
  }

  const counts = await Promise.all([
    prisma.role.count(),
    prisma.permission.count(),
    prisma.rolePermission.count(),
    prisma.category.count(),
    prisma.service.count(),
    prisma.siteSetting.count(),
    prisma.homepageSection.count(),
    prisma.user.count(),
    prisma.galleryAlbum.count(),
    prisma.galleryItem.count(),
  ]);
  console.log(
    `seed ok: roles=${counts[0]} permissions=${counts[1]} rolePermissions=${counts[2]} categories=${counts[3]} services=${counts[4]} settings=${counts[5]} sections=${counts[6]} users=${counts[7]} albums=${counts[8]} photos=${counts[9]}`,
  );
}

main()
  .catch((e) => {
    console.error("seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
