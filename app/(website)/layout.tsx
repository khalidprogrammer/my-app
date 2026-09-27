import { SiteChrome } from "@/components/website/site-chrome";
import { SiteFooter } from "@/components/website/site-footer";
import { getPublicContact } from "@/lib/queries";

/**
 * Public website layout — header, content and footer.
 * Applies only to the (website) route group; admin routes are unaffected.
 * Contact details come from live site settings (DB) with config fallback.
 */
export default async function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const contact = await getPublicContact();
  return (
    <>
      <SiteChrome contact={contact} />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter contact={contact} />
    </>
  );
}
