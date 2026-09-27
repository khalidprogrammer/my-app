import { Container } from "@/components/website/container";
import { PageLoader } from "@/components/ui/loading";

export default function NewsLoading() {
  return (
    <Container className="py-10">
      <PageLoader message="Loading articles…" />
    </Container>
  );
}
