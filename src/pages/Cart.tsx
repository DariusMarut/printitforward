import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, CartItem, Product } from "@/lib/supabase";

type CartItemWithProduct = CartItem & { product: Product };

const Cart = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchCart = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("cart_items")
      .select("*, product:products(*)")
      .eq("user_id", user.id);
    setItems((data as CartItemWithProduct[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchCart(); }, [user]);

  const updateQty = async (id: string, newQty: number) => {
    if (newQty <= 0) { removeItem(id); return; }
    await supabase.from("cart_items").update({ quantity: newQty }).eq("id", id);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: newQty } : i));
  };

  const removeItem = async (id: string) => {
    await supabase.from("cart_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Produs eliminat", description: "Produsul a fost scos din coș." });
  };

  const handleCheckout = async () => {
    if (!user || items.length === 0) return;
    setCheckingOut(true);

    // Create one order per product in cart → saved in `orders` table so they appear in Profile
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

    const { error: ordersError } = await supabase.from("orders").insert(orderInserts);

    if (ordersError) {
      toast({ title: "Eroare la plasarea comenzii", description: ordersError.message, variant: "destructive" });
      setCheckingOut(false);
      return;
    }

    // Clear cart after successful order creation
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    setItems([]);
    setCheckingOut(false);
    toast({
      title: "Comandă plasată!",
      description: `Comanda ta de ${total.toFixed(2)} RON a fost înregistrată și apare în profilul tău.`,
    });
  };

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

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
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
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

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
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
    </Layout>
  );
};

export default Cart;
