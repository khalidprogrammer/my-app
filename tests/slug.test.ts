import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { slugify } from "@/lib/slug";
import { assertSlugShape, linesToArray, resolveSlug } from "@/lib/validations/common";

describe("slugify", () => {
  it("converts business names to URL slugs", () => {
    assert.equal(slugify("Machinery & Equipment"), "machinery-and-equipment");
    assert.equal(slugify("  Héllo  World!! "), "hello-world");
    assert.equal(slugify("Power Facility & Equipment"), "power-facility-and-equipment");
  });

  it("never returns an empty slug", () => {
    assert.equal(slugify("!!!"), "item");
    assert.equal(slugify(""), "item");
  });

  it("collapses separators and trims", () => {
    assert.equal(slugify("a---b   c"), "a-b-c");
    assert.equal(slugify("-hello-"), "hello");
  });
});

describe("slug helpers", () => {
  it("derives from name when blank", () => {
    assert.equal(resolveSlug("Auto Parts", ""), "auto-parts");
    assert.equal(resolveSlug("Auto Parts", "Custom Slug!"), "custom-slug");
  });

  it("validates slug shape", () => {
    assert.equal(assertSlugShape("valid-slug-1"), true);
    assert.equal(assertSlugShape("Bad Slug!"), false);
    assert.equal(assertSlugShape("-leading"), false);
    assert.equal(assertSlugShape(""), false);
  });

  it("splits textarea lines", () => {
    assert.deepEqual(linesToArray("a\n\nb\r\n c "), ["a", "b", "c"]);
    assert.deepEqual(linesToArray(undefined), []);
    assert.deepEqual(linesToArray(""), []);
  });
});
