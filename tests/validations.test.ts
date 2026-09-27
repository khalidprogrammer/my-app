import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { productFormSchema, parseImages, parseSpecs } from "@/lib/validations/product";
import { categoryFormSchema } from "@/lib/validations/category";
import { serviceFormSchema } from "@/lib/validations/service";
import { marketFormSchema } from "@/lib/validations/market";
import { articleFormSchema } from "@/lib/validations/news";
import { quoteUpdateSchema, userFormSchema } from "@/lib/validations/admin";
import { galleryAlbumFormSchema, galleryItemFormSchema } from "@/lib/validations/gallery";
import { MAX_QUOTE_ITEMS, parseQuoteItems, quoteFormSchema } from "@/lib/validations/quote-public";

const minimalProduct = {
  name: "Tmp Pump", slug: "", sku: "", categoryId: "x",
  shortDescription: "", description: "", brand: "", model: "", origin: "",
  applications: "", packaging: "", moq: "", unit: "", featured: false,
  status: "DRAFT", seoTitle: "", seoDescription: "", seoKeywords: "",
  imagesJson: "[]", specsJson: "[]",
};

describe("product validation", () => {
  it("accepts a minimal draft", () => {
    assert.equal(productFormSchema.safeParse(minimalProduct).success, true);
  });

  it("requires a name and valid status", () => {
    assert.equal(productFormSchema.safeParse({ ...minimalProduct, name: "" }).success, false);
    assert.equal(productFormSchema.safeParse({ ...minimalProduct, status: "NOPE" }).success, false);
  });

  it("parses and dedupes images", () => {
    const imgs = parseImages(
      JSON.stringify([{ mediaId: "a", isPrimary: false }, { mediaId: "a", isPrimary: true }]),
    );
    assert.equal(imgs.length, 1);
  });

  it("rejects malformed specs/images payloads", () => {
    assert.throws(() => parseSpecs("not-json"), /Specifications are invalid/);
    assert.throws(
      () => parseImages(JSON.stringify([{ mediaId: "a" }])),
      /Product images are invalid/,
    );
  });
});

describe("catalog validation", () => {
  it("rejects negative category order", () => {
    const r = categoryFormSchema.safeParse({
      name: "A", slug: "", description: "", sortOrder: "-1",
      status: "ACTIVE", seoTitle: "", seoDescription: "", seoKeywords: "",
    });
    assert.equal(r.success, false);
  });

  it("requires service names and article content", () => {
    assert.equal(serviceFormSchema.safeParse({ name: "", slug: "" }).success, false);
    assert.equal(articleFormSchema.safeParse({ title: "T", slug: "", content: "" }).success, false);
  });

  it("rejects unknown market types", () => {
    const base = { name: "M", slug: "", status: "ACTIVE" as const };
    assert.equal(marketFormSchema.safeParse({ ...base, type: "SIDEWAYS" }).success, false);
    assert.equal(marketFormSchema.safeParse({ ...base, type: "BOTH" }).success, true);
  });
});

describe("quote validation", () => {
  it("accepts multiple items", () => {
    const items = parseQuoteItems(
      JSON.stringify([
        { productName: "Bolt", quantity: 10, unit: "pieces", notes: "Grade 8.8" },
        { productName: "Nut", quantity: 20 },
      ]),
    );
    assert.equal(items.length, 2);
  });

  it("rejects empty, malformed, zero-quantity and oversized lists", () => {
    assert.throws(() => parseQuoteItems("[]"), /at least one product/);
    assert.throws(() => parseQuoteItems("nope"), /invalid/);
    assert.throws(
      () => parseQuoteItems(JSON.stringify([{ productName: "X", quantity: 0 }])),
      /greater than 0/,
    );
    const tooMany = Array.from({ length: MAX_QUOTE_ITEMS + 1 }, (_, i) => ({
      productName: `P${i}`,
      quantity: 1,
    }));
    assert.throws(() => parseQuoteItems(JSON.stringify(tooMany)), /At most/);
  });

  it("validates contact fields", () => {
    assert.equal(quoteFormSchema.safeParse({ customerName: "", email: "a@b.com" }).success, false);
    assert.equal(quoteFormSchema.safeParse({ customerName: "N", email: "bad" }).success, false);
    assert.equal(quoteFormSchema.safeParse({ customerName: "N", email: "n@x.com" }).success, true);
  });

  it("accepts all eight admin statuses", () => {
    for (const s of ["NEW", "CONTACTED", "QUOTATION_SENT", "NEGOTIATION", "CONFIRMED", "COMPLETED", "REJECTED", "ARCHIVED"]) {
      assert.equal(quoteUpdateSchema.safeParse({ status: s }).success, true, s);
    }
    assert.equal(quoteUpdateSchema.safeParse({ status: "SHIPPED" }).success, false);
  });
});

describe("user validation", () => {
  it("requires email and at least one role", () => {
    assert.equal(
      userFormSchema.safeParse({ name: "N", email: "bad", password: "", status: "ACTIVE", roles: ["X"] }).success,
      false,
    );
    assert.equal(
      userFormSchema.safeParse({ name: "N", email: "n@x.com", password: "", status: "ACTIVE", roles: [] }).success,
      false,
    );
  });
});

describe("gallery validation", () => {
  it("requires album names and valid statuses", () => {
    assert.equal(
      galleryAlbumFormSchema.safeParse({ name: "", slug: "", description: "", sortOrder: "0", status: "ACTIVE" }).success,
      false,
    );
    assert.equal(
      galleryAlbumFormSchema.safeParse({ name: "Ops", slug: "", description: "", sortOrder: "0", status: "ACTIVE" }).success,
      true,
    );
    assert.equal(
      galleryAlbumFormSchema.safeParse({ name: "Ops", slug: "", description: "", sortOrder: "-1", status: "ACTIVE" }).success,
      false,
    );
  });

  it("requires an image for gallery items", () => {
    assert.equal(galleryItemFormSchema.safeParse({ mediaId: "", caption: "" }).success, false);
    assert.equal(galleryItemFormSchema.safeParse({ mediaId: "abc", caption: "Hall" }).success, true);
  });
});
