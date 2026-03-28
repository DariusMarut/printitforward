import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirect if already logged in
  if (user) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/profile";
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({
        title: "Eroare la autentificare",
        description: error.message === "Invalid login credentials"
          ? "Email sau parolă incorectă."
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Autentificare reușită!", description: "Bine ai revenit." });
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/profile";
      navigate(from, { replace: true });
    }
  };

  return (
    <Layout>
      <section className="py-24 md:py-32 flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md">
          <div className="border border-border bg-card p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight mb-2">Autentificare</h1>
              <p className="text-sm text-muted-foreground">Intră în contul tău PrintItForward</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-mono uppercase tracking-widest">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplu.ro"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-mono uppercase tracking-widest">Parolă</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Se autentifică..." : "Autentificare"}
                <LogIn className="w-4 h-4" />
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Nu ai cont?{" "}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Înregistrează-te
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Login;
