import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 md:py-32 relative grid-bg">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background pointer-events-none" />
      <div className="container relative z-10 text-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
          Pregătit să <span className="text-gradient">printezi</span>?
        </h2>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-10">
          Încarcă modelul tău 3D și primește o ofertă instantanee. Fără obligații.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/upload">
            <Button variant="hero" size="lg">
              Începe Acum
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" size="lg">
              Contactează-ne
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
