import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Metrics } from "@/components/landing/metrics";
import { Features } from "@/components/landing/features";
import { Steps } from "@/components/landing/steps";
import { Modules } from "@/components/landing/modules";
import { ProgressTracking } from "@/components/landing/progress-tracking";
import { Testimonials } from "@/components/landing/testimonials";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/30">
      <Navbar />
      <main className="flex-1 overflow-hidden">
        <Hero />
        <Metrics />
        <Features />
        <Steps />
        <Modules />
        <ProgressTracking />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
