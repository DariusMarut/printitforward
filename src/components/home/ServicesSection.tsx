import { Layers, Palette, Truck, Shield } from "lucide-react";

const services = [
  {
    icon: Layers,
    title: "Printare FDM & SLA",
    description: "Tehnologii multiple pentru orice nevoie — de la prototipuri rapide la piese funcționale cu rezistență mecanică.",
  },
  {
    icon: Palette,
    title: "Culori Personalizate",
    description: "Alege din peste 30 de culori disponibile sau trimite-ne codul RAL pentru potrivire exactă.",
  },
  {
    icon: Truck,
    title: "Livrare Rapidă",
    description: "Comenzile standard sunt procesate și livrate în 24-48h oriunde în România.",
  },
  {
    icon: Shield,
    title: "Calitate Garantată",
    description: "Fiecare piesă trece prin control de calitate. Dacă nu ești mulțumit, o refacem gratuit.",
  },
];

const ServicesSection = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <div className="mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-primary mb-4 block">
            Servicii
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            De ce PrintItForward?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
          {services.map((service, i) => (
            <div
              key={i}
              className="bg-background p-8 md:p-12 group hover:bg-card transition-colors duration-300"
            >
              <service.icon className="w-8 h-8 text-primary mb-6 transition-transform group-hover:scale-110 duration-300" />
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
