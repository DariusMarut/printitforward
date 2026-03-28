import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Alexandru Ionescu",
    role: "Inginer Mecanic",
    text: "Am comandat piese prototip pentru un proiect de robotică. Calitatea suprafeței și precizia dimensională au fost impecabile. Recomand cu încredere!",
    rating: 5,
  },
  {
    name: "Maria Popescu",
    role: "Designer Industrial",
    text: "Colaborarea cu PrintItForward a fost excelentă. Timpul de livrare rapid și comunicarea clară fac diferența. Au printat 200 de piese identice fără nicio abatere.",
    rating: 5,
  },
  {
    name: "Cristian Dumitrescu",
    role: "Fondator Startup Tech",
    text: "Marketplace-ul lor e genial — am găsit piese standard de care aveam nevoie imediat. Iar pentru piesele custom, procesul de upload STL e simplu și intuitiv.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 md:py-32 bg-card border-y border-border">
      <div className="container">
        <div className="mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-primary mb-4 block">
            Testimoniale
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Ce spun clienții noștri
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="border border-border p-8 bg-background hover:border-primary/30 transition-colors duration-300"
            >
              <div className="flex gap-1 mb-6">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>
              <div className="border-t border-border pt-4">
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
