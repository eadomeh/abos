import { useAuthUi } from "@/components/landing/auth-modal";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  const { openAuth } = useAuthUi();

  return (
    <section id="get-started" className="relative px-6 py-12 md:px-10 lg:px-16">
      <div className="cta-glow mx-auto max-w-[1400px] rounded-xl bg-charcoal px-6 py-12 md:px-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="max-w-md lg:col-span-7">
            <h2 className="font-display text-title font-semibold text-harmattan">
              Get started with ABOS
            </h2>
            <p className="mt-4 text-lede text-harmattan-muted">
              Create an account and put the agent on the WhatsApp chats you already run.
            </p>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <Button type="button" size="lg" onClick={() => openAuth("signup")}>
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
