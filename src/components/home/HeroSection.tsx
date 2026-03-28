import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Box } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center grid-bg overflow-hidden">
      {/* Glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse-glow pointer-events-none" />
      
      <div className="container relative z-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-6 opacity-0 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <Box className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono uppercase tracking-widest text-primary">
              Producție Aditivă Industrială
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tighter mb-6 opacity-0 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Printăm
            <br />
            <span className="text-gradient glow-text">Viitorul</span>
            <br />
            Tău.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed opacity-0 animate-fade-up" style={{ animationDelay: "0.35s" }}>
            De la prototip la producție în serie. Fermă de imprimante 3D cu 
            capacitate industrială, precizie sub 0.1mm și livrare rapidă în toată România.
          </p>

          <div className="flex flex-wrap gap-4 opacity-0 animate-fade-up" style={{ animationDelay: "0.5s" }}>
            <Link to="/upload">
              <Button variant="hero" size="lg">
                Încarcă Model
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button variant="outline" size="lg">
                Explorează Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom border accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </section>
  );
};

export default HeroSection;
