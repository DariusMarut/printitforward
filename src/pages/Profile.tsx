import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Settings, Package, Clock, User, ShoppingBag, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, Order, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/supabase";
import { useEffect, useState } from "react";

const Profile = () => {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data as Order[]) || []);
        setLoading(false);
      });
  }, [user]);

  const fullName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim() || "Utilizator"
    : "Utilizator";

  const totalPieces = orders.reduce((sum, o) => sum + o.quantity, 0);
  const inProcessing = orders.filter((o) =>
    ["pending", "processing", "printing"].includes(o.status)
  ).length;

  // Distinguish marketplace orders (prefixed with "marketplace:") from custom STL orders
  const isMarketplaceOrder = (order: Order) =>
    order.stl_file_name.startsWith("marketplace:");

  const getOrderLabel = (order: Order) => {
    if (isMarketplaceOrder(order)) {
      return order.stl_file_name.replace("marketplace:", "");
    }
    return order.stl_file_name;
  };

  return (
    <Layout>
      <section className="py-24 md:py-32">
        <div className="container max-w-4xl">
          {/* Profile Header */}
          <div className="border border-border bg-card p-8 mb-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 border border-border bg-muted flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      key={profile.avatar_url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-muted-foreground">
                      {profile?.first_name?.[0]?.toUpperCase() ||
                        user?.email?.[0]?.toUpperCase() || (
                          <User className="w-8 h-8" />
                        )}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
                  <p className="text-sm text-muted-foreground font-mono">{user?.email}</p>
                  {profile?.city && (
                    <p className="text-xs text-muted-foreground mt-1">{profile.city}</p>
                  )}
                </div>
              </div>
              <Link to="/profile/settings">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                  Editează Profil
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-px bg-border mb-8">
            <div className="bg-background p-6 text-center">
              <p className="text-2xl font-bold font-mono text-primary">{orders.length}</p>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">Comenzi</p>
            </div>
            <div className="bg-background p-6 text-center">
              <p className="text-2xl font-bold font-mono text-primary">{inProcessing}</p>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">În Procesare</p>
            </div>
            <div className="bg-background p-6 text-center">
              <p className="text-2xl font-bold font-mono text-primary">{totalPieces}</p>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">Piese Printate</p>
            </div>
          </div>

          {/* Orders */}
          <div className="border border-border bg-card">
            <div className="p-6 border-b border-border flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Comenzile Mele</h2>
            </div>

            {loading ? (
              <div className="p-12 text-center text-muted-foreground text-sm font-mono">
                Se încarcă comenzile...
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <p className="text-muted-foreground text-sm">Nu ai nicio comandă încă.</p>
                <div className="flex gap-3 justify-center">
                  <Link to="/upload">
                    <Button size="sm" variant="outline">
                      <Upload className="w-4 h-4" />
                      Trimite Model STL
                    </Button>
                  </Link>
                  <Link to="/marketplace">
                    <Button size="sm">
                      <ShoppingBag className="w-4 h-4" />
                      Mergi la Marketplace
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-6 flex items-center justify-between flex-wrap gap-3"
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon to distinguish order type */}
                      <div className="mt-0.5 shrink-0">
                        {isMarketplaceOrder(order) ? (
                          <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Upload className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-mono font-semibold text-sm">{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {getOrderLabel(order)}
                          {" · "}
                          {order.quantity} buc
                          {!isMarketplaceOrder(order) && (
                            <>
                              {" · "}
                              <span className="inline-flex items-center gap-1">
                                <span
                                  className="w-3 h-3 rounded-full inline-block border border-border"
                                  style={{ backgroundColor: order.color_hex }}
                                />
                                {order.color_name}
                              </span>
                            </>
                          )}
                          {order.total_price && (
                            <span className="ml-1 text-primary font-mono">
                              · {order.total_price.toFixed(2)} RON
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          {isMarketplaceOrder(order) ? "Marketplace" : "Model Custom STL"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(order.created_at).toLocaleDateString("ro-RO")}
                      </div>
                      <span
                        className={`text-xs font-mono px-3 py-1 border ${ORDER_STATUS_COLORS[order.status]}`}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Profile;
