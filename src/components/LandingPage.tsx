import type { CSSProperties } from "react";
import { AskAbos } from "@/components/landing/ask-abos";
import { AuthUiProvider } from "@/components/landing/auth-modal";
import { ConversationsSection } from "@/components/landing/conversations-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { LiveRail } from "@/components/landing/live-rail";
import { NetworkSection } from "@/components/landing/network-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteNav } from "@/components/landing/site-nav";
import { ThinkSection } from "@/components/landing/think-section";
import { VisionSection } from "@/components/landing/vision-section";

interface LandingPageProps {
  onGetStarted?: () => void;
}

export default function LandingPage(_props: LandingPageProps) {
  const vars = {
    "--color-onyx": "#04080a",
  } as CSSProperties;

  return (
    <AuthUiProvider>
      <div
        className="relative min-h-screen overflow-x-hidden bg-onyx text-harmattan"
        style={vars}
      >
        <div className="ambient-layer" aria-hidden="true" />
        <div className="relative z-10">
          <SiteNav />

          <main>
            <HeroSection />
            <LiveRail />
            <FeaturesSection />
            <NetworkSection />
            <ConversationsSection />
            <ThinkSection />
            <ProblemSection />
            <VisionSection />
          </main>

          <SiteFooter />
          <AskAbos />
        </div>
      </div>
    </AuthUiProvider>
  );
}
