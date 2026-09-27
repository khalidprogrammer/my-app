import { Container } from "@/components/website/container";
import { PageLoader } from "@/components/ui/loading";

/** Global loading fallback for routes without a dedicated loading.tsx. */
export default function GlobalLoading() {
  return (
    <Container className="py-10">
      <PageLoader message="Loading…" />
    </Container>
  );
}
