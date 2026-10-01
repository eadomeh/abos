import { ArrowRight } from "lucide-react";
import { useAuthUi } from "@/components/landing/auth-modal";
import { Button } from "@/components/ui/button";

export function VisionSection() {
  const { openAuth } = useAuthUi();

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-5 text-center sm:px-8">
        <p className="text-xs uppercase tracking-widest text-signal/80">The vision</p>
        <h2 className="mx-auto mt-4 max-w-4xl font-display text-title font-semibold tracking-[-0.05em] sm:text-6xl">
          Not another chatbot. The operating layer behind the business.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-harmattan-muted">
          ABOS understands the business, remembers the business, coordinates the business, automates the
          business, and helps the business act — with humans still in control.
        </p>
        <Button type="button" size="lg" className="mt-9 rounded-2xl px-7 py-4" onClick={() => openAuth("signup")}>
          Start with ABOS
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </section>
  );
}
