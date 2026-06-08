
import HeroSection from "@/components/hero/HeroSection";
import TasksSection from "@/components/sections/TasksSection";
import DashboardPreviewSection from "@/components/sections/DashboardPreviewSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import CTASection from "@/components/sections/CTASection";
import Footer from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <>
      <main>
        <HeroSection />
        <TasksSection />
        <DashboardPreviewSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}