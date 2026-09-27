// Demo product data for development/showcase ONLY ("for now").
// Clearly fake catalog entries so pages, search, filters and detail views
// can be reviewed before real products are entered in admin.
// Idempotent: safe to re-run (upserts by slug; relations set on create).
//
// Run: npx tsx scripts/seed-demo-products.ts
// Remove: delete rows with slug LIKE 'demo-%' (see bottom), or run the
// cleanup block by setting CLEANUP_DEMO=true.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type DemoSpec = { name: string; value: string };
type DemoProduct = {
  slug: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  model: string;
  short: string;
  description: string;
  applications: string;
  packaging: string;
  moq: number;
  unit: string;
  featured?: boolean;
  image?: string;
  specs: DemoSpec[];
};

const PRODUCTS: DemoProduct[] = [
  {
    slug: "demo-hydraulic-gear-pump",
    name: "Hydraulic Gear Pump HP-200",
    sku: "DEMO-HP-200",
    category: "machinery-equipment",
    brand: "DemoWorks",
    model: "HP-200-20M",
    short: "High-pressure hydraulic gear pump for industrial machinery.",
    description:
      "Demo product: cast-iron hydraulic gear pump rated for continuous duty in presses, lifts and machine tools.",
    applications: "Hydraulic presses, lift platforms, machine tools.",
    packaging: "Export carton on pallets",
    moq: 50,
    unit: "pieces",
    featured: true,
    image: "images/hero-containers.jpg",
    specs: [
      { name: "Max pressure", value: "20 MPa" },
      { name: "Displacement", value: "16 cc/rev" },
      { name: "Speed range", value: "600–3000 rpm" },
    ],
  },
  {
    slug: "demo-excavator-x200",
    name: "Crawler Excavator X200",
    sku: "DEMO-EX-200",
    category: "machinery-equipment",
    brand: "DemoWorks",
    model: "X200",
    short: "20-ton crawler excavator for earthmoving and construction.",
    description: "Demo product: fuel-efficient 20-ton class excavator with reinforced boom and stick.",
    applications: "Earthmoving, road construction, mining support.",
    packaging: "Nude packing, lashed in container",
    moq: 1,
    unit: "units",
    specs: [
      { name: "Operating weight", value: "20,000 kg" },
      { name: "Engine power", value: "129 kW" },
      { name: "Bucket capacity", value: "1.1 m³" },
    ],
  },
  {
    slug: "demo-hex-bolt-m12",
    name: "Hex Bolt M12 Grade 8.8",
    sku: "DEMO-HB-M12",
    category: "hardware-products",
    brand: "DemoFast",
    model: "HB-M12-88",
    short: "Zinc-plated hex bolts for structural and machinery assembly.",
    description: "Demo product: grade 8.8 hex head bolts, zinc plated, full thread options.",
    applications: "Steel structures, machinery assembly, automotive.",
    packaging: "25 kg cartons on pallets",
    moq: 1000,
    unit: "pieces",
    featured: true,
    specs: [
      { name: "Thread", value: "M12 x 1.75" },
      { name: "Grade", value: "8.8" },
      { name: "Finish", value: "Zinc plated" },
    ],
  },
  {
    slug: "demo-brake-pad-set",
    name: "Ceramic Brake Pad Set BP-450",
    sku: "DEMO-BP-450",
    category: "auto-parts",
    brand: "DemoAuto",
    model: "BP-450",
    short: "Low-dust ceramic brake pads for passenger vehicles.",
    description: "Demo product: ceramic formulation pads with shims and hardware kit included.",
    applications: "Passenger cars, SUVs, light trucks.",
    packaging: "Color box, 20 sets per carton",
    moq: 200,
    unit: "sets",
    featured: true,
    specs: [
      { name: "Friction rating", value: "GG" },
      { name: "Temperature range", value: "up to 650 °C" },
      { name: "Includes", value: "Shims + hardware kit" },
    ],
  },
  {
    slug: "demo-led-highbay",
    name: "LED High Bay Light 150W",
    sku: "DEMO-LED-150",
    category: "electronic-products",
    brand: "DemoBright",
    model: "HB-150-IP65",
    short: "IP65 LED high bay for warehouses and workshops.",
    description: "Demo product: die-cast aluminum high bay with mean-well driver and 5-year design life.",
    applications: "Warehouses, workshops, exhibition halls.",
    packaging: "Individual carton, 4 per master carton",
    moq: 100,
    unit: "pieces",
    specs: [
      { name: "Power", value: "150 W" },
      { name: "Luminous flux", value: "21,000 lm" },
      { name: "Ingress protection", value: "IP65" },
    ],
  },
  {
    slug: "demo-steel-coil",
    name: "Galvanized Steel Coil DX51D",
    sku: "DEMO-ST-DX51",
    category: "building-materials",
    brand: "DemoSteel",
    model: "DX51D-Z275",
    short: "Hot-dip galvanized steel coils for construction and fabrication.",
    description: "Demo product: continuous galvanized coils with regular spangle, oiled surface.",
    applications: "Roofing, ducting, structural fabrication.",
    packaging: "Eye-to-sky, steel strapped",
    moq: 25,
    unit: "tons",
    featured: true,
    image: "images/hero-warehouse.jpg",
    specs: [
      { name: "Grade", value: "DX51D+Z" },
      { name: "Zinc coating", value: "Z275" },
      { name: "Thickness", value: "0.3–2.0 mm" },
    ],
  },
  {
    slug: "demo-pp-woven-bag",
    name: "PP Woven Sack 50kg",
    sku: "DEMO-PP-50",
    category: "plastic-products",
    brand: "DemoPack",
    model: "PPW-50",
    short: "Laminated PP woven sacks for grain, feed and chemicals.",
    description: "Demo product: tubular PP woven sacks with optional inner liner and printing.",
    applications: "Grain, animal feed, fertilizer, chemicals.",
    packaging: "Bales of 500 pieces",
    moq: 10000,
    unit: "pieces",
    specs: [
      { name: "Capacity", value: "50 kg" },
      { name: "Fabric weight", value: "70 g/m²" },
      { name: "Printing", value: "Up to 4 colors" },
    ],
  },
  {
    slug: "demo-office-chair",
    name: "Ergonomic Office Chair EC-9",
    sku: "DEMO-EC-9",
    category: "office-supplies",
    brand: "DemoOffice",
    model: "EC-9",
    short: "Mesh-back ergonomic chair with lumbar support.",
    description: "Demo product: adjustable mesh chair with 3D armrests and synchro-tilt mechanism.",
    applications: "Offices, home workstations, call centers.",
    packaging: "Flat pack, 1 pc per carton",
    moq: 100,
    unit: "pieces",
    specs: [
      { name: "Backrest", value: "Breathable mesh" },
      { name: "Mechanism", value: "Synchro-tilt, 4 lock positions" },
      { name: "Max load", value: "150 kg" },
    ],
  },
  {
    slug: "demo-motor-15kw",
    name: "Three-Phase Motor 15kW IE3",
    sku: "DEMO-M15-IE3",
    category: "mechanical-electrical-equipment",
    brand: "DemoDrive",
    model: "YE3-160L-4",
    short: "IE3 high-efficiency motor for pumps, fans and conveyors.",
    description: "Demo product: cast-iron frame motor, class F insulation, IP55 enclosure.",
    applications: "Pumps, fans, compressors, conveyors.",
    packaging: "Plywood case",
    moq: 20,
    unit: "pieces",
    specs: [
      { name: "Rated power", value: "15 kW" },
      { name: "Efficiency", value: "IE3, 92.1%" },
      { name: "Protection", value: "IP55" },
    ],
  },
  {
    slug: "demo-transformer-500",
    name: "Distribution Transformer 500kVA",
    sku: "DEMO-TR-500",
    category: "power-facility-equipment-materials",
    brand: "DemoPower",
    model: "S11-500/10",
    short: "Oil-immersed distribution transformer for grid and industrial use.",
    description: "Demo product: low-loss silicon steel core transformer with on-load tap changer option.",
    applications: "Power distribution, industrial plants, renewables.",
    packaging: "Steel frame, moisture-proof cover",
    moq: 1,
    unit: "units",
    specs: [
      { name: "Capacity", value: "500 kVA" },
      { name: "Voltage ratio", value: "10/0.4 kV" },
      { name: "Vector group", value: "Dyn11" },
    ],
  },
  {
    slug: "demo-green-tea",
    name: "Bulk Green Tea Grade A",
    sku: "DEMO-GT-A",
    category: "prepackaged-food",
    brand: "DemoTea",
    model: "GT-A-2024",
    short: "Spring-harvest green tea for retail and wholesale packing.",
    description: "Demo product: pan-fired green tea, vacuum-packed for export freshness.",
    applications: "Retail packing, tea houses, distributors.",
    packaging: "Vacuum bags, 25 kg cartons",
    moq: 500,
    unit: "kg",
    specs: [
      { name: "Grade", value: "A, spring harvest" },
      { name: "Moisture", value: "≤ 6%" },
      { name: "Shelf life", value: "18 months" },
    ],
  },
  {
    slug: "demo-cnc-controller",
    name: "CNC Controller Kit 4-Axis",
    sku: "DEMO-CNC-4X",
    category: "technology-services",
    brand: "DemoTech",
    model: "CNC-4X-PRO",
    short: "4-axis CNC control kit with drives and handwheel.",
    description: "Demo product: complete retrofit kit with stepper drives, breakout board and pendant.",
    applications: "CNC retrofits, routers, mills, plasma tables.",
    packaging: "Anti-static box set",
    moq: 10,
    unit: "sets",
    specs: [
      { name: "Axes", value: "4 (expandable to 6)" },
      { name: "Pulse rate", value: "200 kHz" },
      { name: "Interface", value: "USB + Ethernet" },
    ],
  },
];

async function main() {
  if (process.env.CLEANUP_DEMO === "true") {
    const gone = await prisma.product.deleteMany({ where: { slug: { startsWith: "demo-" } } });
    console.log(`demo cleanup: removed ${gone.count} products`);
    return;
  }

  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const catId = new Map(categories.map((c) => [c.slug, c.id]));
  const media = await prisma.media.findMany({
    where: { storageKey: { startsWith: "images/hero-" } },
    select: { id: true, storageKey: true },
  });
  const mediaId = new Map(media.map((m) => [m.storageKey, m.id]));

  let created = 0;
  let updated = 0;
  for (const p of PRODUCTS) {
    const categoryId = catId.get(p.category);
    if (!categoryId) {
      console.log(`skip ${p.slug}: category ${p.category} missing`);
      continue;
    }
    const existing = await prisma.product.findUnique({ where: { slug: p.slug }, select: { id: true } });
    const scalars = {
      categoryId,
      name: p.name,
      sku: p.sku,
      shortDescription: p.short,
      description: p.description,
      brand: p.brand,
      model: p.model,
      origin: "Guangxi, China",
      applications: p.applications,
      packaging: p.packaging,
      moq: p.moq,
      unit: p.unit,
      featured: p.featured ?? false,
      status: "PUBLISHED" as const,
    };
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data: scalars });
      updated += 1;
      continue;
    }
    const imageId = p.image ? mediaId.get(p.image) : undefined;
    await prisma.product.create({
      data: {
        ...scalars,
        slug: p.slug,
        specs: { create: p.specs.map((s, i) => ({ ...s, sortOrder: i })) },
        ...(imageId
          ? { images: { create: [{ mediaId: imageId, isPrimary: true, sortOrder: 0 }] } }
          : {}),
      },
    });
    created += 1;
  }
  const total = await prisma.product.count({ where: { slug: { startsWith: "demo-" } } });
  console.log(`demo seed: created=${created} updated=${updated} total_demo=${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
