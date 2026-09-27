"use client";

import * as React from "react";
import { SiteHeader } from "@/components/website/site-header";
import { MobileNav } from "@/components/website/mobile-nav";
import type { PublicContact } from "@/lib/queries";

/** SiteChrome — owns mobile-menu state shared by header + nav panel. */
function SiteChrome({ contact }: { contact: PublicContact }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <>
      <SiteHeader onOpenMenu={() => setMenuOpen((v) => !v)} menuOpen={menuOpen} contact={contact} />
      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} contact={contact} />
    </>
  );
}

export { SiteChrome };
