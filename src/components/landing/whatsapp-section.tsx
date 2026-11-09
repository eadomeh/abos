import { WhatsappThread } from "@/components/landing/whatsapp-thread";

/** Dedicated home for the existing WhatsApp demonstration. The thread animation is unchanged. */
export function WhatsappSection() {
  return (
    <section id="whatsapp-demo" className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-14" aria-labelledby="whatsapp-demo-title">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-signal">Conversation layer</p>
        <h2 id="whatsapp-demo-title" className="mt-3 font-display text-title font-semibold text-harmattan">
          The chats the business already runs.
        </h2>
        <p className="mt-4 text-lede text-harmattan-muted">
          An illustrative preview of ABOS beside WhatsApp. These messages are scripted. They are not live customer traffic.
        </p>
      </div>
      <div className="hero-stage">
        <WhatsappThread />
      </div>
    </section>
  );
}
