import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Filter, Search, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, Product } from "@/lib/supabase";

const CATEGORY_LABELS: Record<string, string> = {
  Toate: "Toate",
  mecanice: "Mecanice",
  electronice: "Electronice",
  accesorii: "Accesorii",
  birou: "Birou",
  casă: "Casă",
  general: "General",
};

// Highlight matching substring in product name
const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/20 text-primary rounded-sm px-0.5 not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
};

const Marketplace = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Toate");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProducts((data as Product[]) || []);
        setLoading(false);
      });
  }, []);

  // Ctrl/Cmd+K focuses the search bar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setSearch("");
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const categories = ["Toate", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    const matchesCategory = activeCategory === "Toate" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase().trim());
    return matchesCategory && matchesSearch;
  });

  const addToCart = async (product: Product) => {
    if (!user) {
      toast({
        title: "Autentificare necesară",
        description: "Trebuie să fii autentificat pentru a adăuga în coș.",
        variant: "destructive",
      });
      return;
    }
    setAddingId(product.id);
    const { error } = await supabase
      .from("cart_items")
      .upsert(
        { user_id: user.id, product_id: product.id, quantity: 1 },
        { onConflict: "user_id,product_id" }
      );
    setAddingId(null);
    if (error) {
      toast({ title: "Eroare", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Adăugat în coș!", description: `${product.name} a fost adăugat.` });
    }
  };

  const hasActiveSearch = search.trim().length > 0;

  return (
    <Layout>
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-primary mb-4 block">
              Magazin
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Marketplace
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Piese 3D gata de comandat. Printate cu grijă, livrate rapid.
            </p>
          </div>

          {/* Search + Filters row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search bar */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                ref={searchRef}
                type="text"
                placeholder="Caută produse…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-9 bg-card border-border font-mono text-sm placeholder:text-muted-foreground/60"
              />
              {hasActiveSearch ? (
                <button
                  onClick={() => { setSearch(""); searchRef.current?.focus(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Șterge căutarea"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground/40 hidden sm:block select-none">
                  ⌘K
                </span>
              )}
            </div>

            {/* Category filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-sm font-mono whitespace-nowrap border transition-colors ${
                    activeCategory === cat
                      ? "border-primary text-primary bg-primary/5"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                  }`}
                >
                  {CATEGORY_LABELS[cat] || cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results count when searching */}
          {hasActiveSearch && !loading && (
            <p className="text-xs font-mono text-muted-foreground mb-4">
              {filtered.length === 0
                ? `Niciun rezultat pentru „${search}"`
                : `${filtered.length} ${filtered.length === 1 ? "rezultat" : "rezultate"} pentru „${search}"`}
            </p>
          )}

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-background p-6 animate-pulse">
                  <div className="aspect-square bg-muted mb-4" />
                  <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                  <div className="h-8 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="border border-border bg-card p-16 text-center space-y-3">
              <Search className="w-10 h-10 text-muted-foreground/30 mx-auto" />
              <p className="text-muted-foreground">
                {hasActiveSearch
                  ? `Nu am găsit niciun produs pentru „${search}".`
                  : "Niciun produs în această categorie."}
              </p>
              {hasActiveSearch && (
                <button
                  onClick={() => setSearch("")}
                  className="text-sm text-primary hover:underline font-mono"
                >
                  Șterge căutarea
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
              {filtered.map((product) => (
                <div
                  key={product.id}
                  className="bg-background p-6 group hover:bg-card transition-colors duration-200"
                >
                  <div className="aspect-square border border-border flex items-center justify-center mb-4 group-hover:border-primary/30 transition-colors overflow-hidden bg-muted">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="opacity-40">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                        <span className="text-xs font-mono opacity-40">3D</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                      {CATEGORY_LABELS[product.category] || product.category}
                    </p>
                    <h3 className="font-semibold">
                      <HighlightMatch text={product.name} query={search} />
                    </h3>
                    {product.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <span className="font-mono font-bold text-primary">{product.price.toFixed(2)} RON</span>
                      {product.stock === 0 && (
                        <span className="text-xs font-mono text-muted-foreground">Stoc epuizat</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => addToCart(product)}
                      disabled={addingId === product.id || product.stock === 0}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {addingId === product.id ? "Se adaugă..." : "Adaugă în Coș"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Marketplace;
