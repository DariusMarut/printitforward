import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Printer, ShoppingCart, User, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { label: "Acasă", path: "/" },
  { label: "Marketplace", path: "/marketplace" },
  { label: "Încarcă Model", path: "/upload" },
  { label: "Contact", path: "/contact" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { itemCount } = useCart();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Deconectat", description: "La revedere!" });
    navigate("/");
  };

  const displayName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim() || user?.email
    : user?.email;

  // Avatar component — shows photo if available, else initial letter
  const AvatarBadge = ({ size = "sm" }: { size?: "sm" | "lg" }) => {
    const dim = size === "sm" ? "w-7 h-7" : "w-9 h-9";
    const textSize = size === "sm" ? "text-xs" : "text-sm";
    return (
      <div className={`${dim} rounded-full border border-primary/30 flex items-center justify-center overflow-hidden bg-primary/10 shrink-0`}>
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="Avatar"
            className="w-full h-full object-cover"
            // Key on avatar_url forces re-render when URL changes
            key={profile.avatar_url}
          />
        ) : (
          <span className={`${textSize} font-bold text-primary select-none`}>
            {profile?.first_name?.[0]?.toUpperCase() ||
              user?.email?.[0]?.toUpperCase() ||
              <User className="w-3 h-3" />}
          </span>
        )}
      </div>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <Printer className="w-6 h-6 text-primary transition-transform group-hover:rotate-12" />
          <span className="font-bold text-lg tracking-tight text-foreground">
            PRINT<span className="text-primary">IT</span>FORWARD
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {/* Coșul e mereu vizibil — și pentru guest */}
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center leading-none">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Button>
          </Link>
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 px-2">
                    <AvatarBadge size="sm" />
                    <span className="max-w-[120px] truncate text-sm">{displayName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Profilul Meu
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile/settings" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Setări
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-destructive flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Deconectare
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Autentificare</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Înregistrare</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="container py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 text-sm font-medium rounded transition-colors ${
                  location.pathname === item.path
                    ? "text-primary bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
              {user ? (
                <>
                  <Link to="/profile" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full gap-2" size="sm">
                      <AvatarBadge size="sm" />
                      Profil
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    size="sm"
                    onClick={() => { handleSignOut(); setMobileOpen(false); }}
                  >
                    <LogOut className="w-4 h-4 mr-1" /> Deconectare
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full" size="sm">Autentificare</Button>
                  </Link>
                  <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full" size="sm">Înregistrare</Button>
                  </Link>
                </>
              )}
              {/* Coș mobil — mereu vizibil */}
              <Link to="/cart" className="w-full mt-1" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full relative" size="sm">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Coș
                  {itemCount > 0 && (
                    <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
