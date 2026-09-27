import { Container } from "@/components/website/container";
import { PageLoader } from "@/components/ui/loading";

export default function ProductsLoading() {
  return (
    <Container className="py-10">
      <PageLoader message="Loading products…" />
    </Container>
  );
}
