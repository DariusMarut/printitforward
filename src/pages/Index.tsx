import Layout from "@/components/Layout";
import HeroSection from "@/components/home/HeroSection";
import ServicesSection from "@/components/home/ServicesSection";
import StatsSection from "@/components/home/StatsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <TestimonialsSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
