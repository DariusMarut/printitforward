import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const Cart = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, loading, updateQty, removeItem, clearCart } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handleRemove = async (productId: string) => {
    await removeItem(productId);
    toast({ title: "Produs eliminat", description: "Produsul a fost scos din coș." });
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    // Dacă nu e autentificat → arătăm dialogul
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    setCheckingOut(true);

    const orderInserts = items.map((item) => ({
      user_id: user.id,
      stl_file_name: `marketplace:${item.product.name}`,
      stl_file_url: item.product.image_url || null,
      color_name: "Standard",
      color_hex: "#6b7280",
      quantity: item.quantity,
      notes: `Comandă Marketplace — ${item.product.name}`,
      status: "pending" as const,
      total_price: item.product.price * item.quantity,
    }));

    const { error } = await supabase.from("orders").insert(orderInserts);

    if (error) {
      toast({ title: "Eroare la plasarea comenzii", description: error.message, variant: "destructive" });
      setCheckingOut(false);
      return;
    }

    await clearCart();
    setCheckingOut(false);
    toast({
      title: "Comandă plasată!",
      description: `Comanda ta de ${total.toFixed(2)} RON a fost înregistrată și apare în profilul tău.`,
    });
  };

  return (
    <Layout>
      <section className="py-24 md:py-32">
        <div className="container max-w-3xl">
          <div className="mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-primary mb-4 block">
              Coșul tău
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Coș de cumpărături
            </h1>
          </div>

          {loading ? (
            <div className="border border-border bg-card p-12 text-center text-muted-foreground text-sm font-mono">
              Se încarcă coșul...
            </div>
          ) : items.length === 0 ? (
            <div className="border border-border bg-card p-12 text-center space-y-4">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Coșul tău este gol.</p>
              <Link to="/marketplace">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4" />
                  Înapoi la Marketplace
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-px bg-border">
              {items.map((item) => (
                <div key={item.id} className="bg-background p-6 flex items-center gap-6">
                  <div className="w-16 h-16 border border-border flex items-center justify-center shrink-0 overflow-hidden bg-muted">
                    {item.product.image_url ? (
                      <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                      {item.product.category}
                    </p>
                    <h3 className="font-semibold truncate">{item.product.name}</h3>
                    <span className="font-mono text-primary">{item.product.price.toFixed(2)} RON</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="w-8 h-8 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="w-8 h-8 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="font-mono font-bold w-24 text-right">
                    {(item.product.price * item.quantity).toFixed(2)} RON
                  </span>

                  <button onClick={() => handleRemove(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="bg-card p-6 flex items-center justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-mono font-bold text-primary">{total.toFixed(2)} RON</span>
              </div>

              <div className="bg-background p-6 flex flex-col sm:flex-row gap-3 justify-between">
                <Link to="/marketplace">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4" />
                    Continuă cumpărăturile
                  </Button>
                </Link>
                <Button size="lg" onClick={handleCheckout} disabled={checkingOut}>
                  <ShoppingCart className="w-4 h-4" />
                  {checkingOut ? "Se procesează..." : "Plasează comanda"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Dialog autentificare la checkout */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Finalizează comanda</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Pentru a plasa comanda ai nevoie de un cont. Produsele din coș sunt salvate — nu se pierd la autentificare.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            {/* Rezumat produse */}
            <div className="border border-border bg-muted/30 p-4 space-y-2 rounded-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate max-w-[200px]">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-mono font-semibold shrink-0 ml-4">
                    {(item.product.price * item.quantity).toFixed(2)} RON
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-border flex justify-between text-sm font-bold">
                <span>Total</span>
                <span className="font-mono text-primary">{total.toFixed(2)} RON</span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                setShowAuthDialog(false);
                navigate('/login', { state: { from: { pathname: '/cart' } } });
              }}
            >
              <LogIn className="w-4 h-4" />
              Autentifică-te
            </Button>

            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => {
                setShowAuthDialog(false);
                navigate('/register', { state: { from: { pathname: '/cart' } } });
              }}
            >
              <UserPlus className="w-4 h-4" />
              Creează un cont nou
            </Button>

            <p className="text-xs text-center text-muted-foreground pt-1">
              Produsele tale vor fi păstrate în coș și după autentificare.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Cart;
