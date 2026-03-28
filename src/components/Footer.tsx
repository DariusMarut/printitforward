import { Link } from "react-router-dom";
import { Printer, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      {/* Giant brand text */}
      <div className="overflow-hidden py-12 border-b border-border">
        <p className="text-[6vw] md:text-[4vw] font-bold tracking-tighter text-transparent select-none"
          style={{ WebkitTextStroke: "1px hsl(var(--border))" }}>
          PRINTITFORWARD
        </p>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Printer className="w-5 h-5 text-primary" />
              <span className="font-bold tracking-tight text-foreground">
                PRINT<span className="text-primary">IT</span>FORWARD
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Producție aditivă la scară industrială. Precizie și calitate în fiecare piesă.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Navigare
            </h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Acasă</Link>
              <Link to="/marketplace" className="text-sm text-muted-foreground hover:text-primary transition-colors">Marketplace</Link>
              <Link to="/upload" className="text-sm text-muted-foreground hover:text-primary transition-colors">Încarcă Model</Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Cont
            </h4>
            <div className="flex flex-col gap-2">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">Autentificare</Link>
              <Link to="/register" className="text-sm text-muted-foreground hover:text-primary transition-colors">Înregistrare</Link>
              <Link to="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">Profilul Meu</Link>
              <Link to="/cart" className="text-sm text-muted-foreground hover:text-primary transition-colors">Coș de Cumpărături</Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Contact
            </h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                contact@printitforward.ro
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                +40 123 456 789
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                Arad, România
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-mono">
            © 2026 PrintItForward. Toate drepturile rezervate.
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            Fabricat cu precizie în România 🇷🇴
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
