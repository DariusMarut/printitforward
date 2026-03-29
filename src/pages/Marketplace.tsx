import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Filter, Search, X, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useCart } from "@/contexts/CartContext";
import { supabase, Product } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Constants ────────────────────────────────────────────────
const PRODUCTS_PER_PAGE = 16;

const CATEGORY_LABELS: Record<string, string> = {
  Toate: "Toate",
  mecanice: "Mecanice",
  electronice: "Electronice",
  accesorii: "Accesorii",
  birou: "Birou",
  casă: "Casă",
  general: "General",
};

type SortKey = "default" | "name_asc" | "name_desc" | "price_asc" | "price_desc" | "category" | "stock_asc" | "stock_desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "default",     label: "Implicit (recent)" },
  { value: "name_asc",    label: "Nume A → Z" },
  { value: "name_desc",   label: "Nume Z → A" },
  { value: "price_asc",   label: "Preț crescător" },
  { value: "price_desc",  label: "Preț descrescător" },
  { value: "category",    label: "Categorie" },
  { value: "stock_asc",   label: "Stoc crescător" },
  { value: "stock_desc",  label: "Stoc descrescător" },
];

// ── Helpers ──────────────────────────────────────────────────
const sortProducts = (products: Product[], sort: SortKey): Product[] => {
  const arr = [...products];
  switch (sort) {
    case "name_asc":    return arr.sort((a, b) => a.name.localeCompare(b.name, "ro"));
    case "name_desc":   return arr.sort((a, b) => b.name.localeCompare(a.name, "ro"));
    case "price_asc":   return arr.sort((a, b) => a.price - b.price);
    case "price_desc":  return arr.sort((a, b) => b.price - a.price);
    case "category":    return arr.sort((a, b) => a.category.localeCompare(b.category, "ro") || a.name.localeCompare(b.name, "ro"));
    case "stock_asc":   return arr.sort((a, b) => a.stock - b.stock);
    case "stock_desc":  return arr.sort((a, b) => b.stock - a.stock);
    default:            return arr;
  }
};

// Highlight matching substring
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

// Stock badge
const StockBadge = ({ stock }: { stock: number }) => {
  if (stock <= 0) {
    return (
      <span className="text-xs font-mono px-2 py-0.5 border border-destructive/30 text-destructive">
        Stoc epuizat
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="text-xs font-mono px-2 py-0.5 border border-yellow-500/30 text-yellow-500">
        Ultimele {stock}
      </span>
    );
  }
  return (
    <span className="text-xs font-mono text-muted-foreground">
      {stock} în stoc
    </span>
  );
};

// Pagination with ellipsis
const Pagination = ({
  current, total, onChange,
}: {
  current: number; total: number; onChange: (p: number) => void;
}) => {
  if (total <= 1) return null;

  const pages: (number | "...")[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("...");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 2) pages.push("...");
    pages.push(total);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="w-8 h-8 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Pagina anterioară"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-muted-foreground text-sm font-mono select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`w-8 h-8 flex items-center justify-center border text-sm font-mono transition-colors ${
              current === p
                ? "border-primary text-primary bg-primary/5"
                : "border-border text-muted-foreground hover:text-foreground hover:border-primary"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="w-8 h-8 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Pagina următoare"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────
const Marketplace = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addItem, items: cartItems } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Toate");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("default");
  const [page, setPage] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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

  // Keyboard shortcut ⌘K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "Escape") { setSearch(""); searchRef.current?.blur(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Reset to page 1 when filters/sort/search change
  useEffect(() => { setPage(1); }, [activeCategory, search, sortKey]);

  // Scroll to top of grid when page changes
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const categories = ["Toate", ...Array.from(new Set(products.map((p) => p.category)))];

  // Filter → sort → paginate
  const filtered = sortProducts(
    products.filter((p) => {
      const matchesCategory = activeCategory === "Toate" || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase().trim());
      return matchesCategory && matchesSearch;
    }),
    sortKey
  );

  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE);
  const hasActiveSearch = search.trim().length > 0;

  const addToCart = async (product: Product) => {
    setAddingId(product.id);
    await addItem(product);

    // Decrement stock locally so UI updates immediately without refetch
    setProducts((prev) =>
      prev.map((p) => p.id === product.id ? { ...p, stock: Math.max(0, p.stock - 1) } : p)
    );

    setAddingId(null);
    const alreadyIn = cartItems.some((i) => i.id === product.id);
    toast({
      title: alreadyIn ? "Cantitate actualizată" : "Adăugat în coș!",
      description: `${product.name} ${alreadyIn ? "a fost actualizat." : "a fost adăugat."}`,
      action: (
        <ToastAction altText="Vezi coșul" onClick={() => navigate("/cart")} className="font-mono text-xs">
          Vezi coșul →
        </ToastAction>
      ),
    });
  };

  return (
    <Layout>
      <section className="py-24 md:py-32">
        <div className="container">
          {/* Header */}
          <div className="mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-primary mb-4 block">Magazin</span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">Marketplace</h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Piese 3D gata de comandat. Printate cu grijă, livrate rapid.
            </p>
          </div>

          {/* Controls row: Search + Sort + Filter */}
          <div className="flex flex-col gap-3 mb-6" ref={gridRef}>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
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
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground/40 hidden sm:block select-none">⌘K</span>
                )}
              </div>

              {/* Sort */}
              <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                <SelectTrigger className="w-full sm:w-52 bg-card border-border font-mono text-sm">
                  <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Sortează" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="font-mono text-sm">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
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

          {/* Results info */}
          {!loading && (
            <p className="text-xs font-mono text-muted-foreground mb-4">
              {hasActiveSearch
                ? filtered.length === 0
                  ? `Niciun rezultat pentru „${search}"`
                  : `${filtered.length} ${filtered.length === 1 ? "rezultat" : "rezultate"} pentru „${search}" · pagina ${page} din ${totalPages}`
                : filtered.length > 0
                  ? `${filtered.length} produse · pagina ${page} din ${totalPages}`
                  : ""}
            </p>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
              {[...Array(PRODUCTS_PER_PAGE)].map((_, i) => (
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
                {hasActiveSearch ? `Nu am găsit niciun produs pentru „${search}".` : "Niciun produs în această categorie."}
              </p>
              {hasActiveSearch && (
                <button onClick={() => setSearch("")} className="text-sm text-primary hover:underline font-mono">
                  Șterge căutarea
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
                {paginated.map((product) => {
                  const outOfStock = product.stock <= 0;
                  return (
                    <div
                      key={product.id}
                      className="bg-background p-6 group hover:bg-card transition-colors duration-200"
                    >
                      {/* Image */}
                      <div className="aspect-square border border-border flex items-center justify-center mb-4 group-hover:border-primary/30 transition-colors overflow-hidden bg-muted relative">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${outOfStock ? "opacity-50 grayscale" : ""}`}
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
                        {outOfStock && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-background/80 backdrop-blur-sm text-xs font-mono px-3 py-1 border border-destructive/40 text-destructive">
                              STOC EPUIZAT
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
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

                        {/* Price + Stock */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-mono font-bold text-primary">{product.price.toFixed(2)} RON</span>
                          <StockBadge stock={product.stock} />
                        </div>

                        {/* Add to cart — always enabled, even when out of stock */}
                        <Button
                          size="sm"
                          className={`w-full ${outOfStock ? "opacity-70" : ""}`}
                          variant={outOfStock ? "outline" : "default"}
                          onClick={() => addToCart(product)}
                          disabled={addingId === product.id}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {addingId === product.id
                            ? "Se adaugă..."
                            : outOfStock
                              ? "Comandă (stoc epuizat)"
                              : "Adaugă în Coș"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <Pagination current={page} total={totalPages} onChange={handlePageChange} />
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Marketplace;
