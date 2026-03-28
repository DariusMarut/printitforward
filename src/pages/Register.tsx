import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", confirm: "",
  });

  if (user) { navigate("/profile", { replace: true }); return null; }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast({ title: "Parolele nu coincid", variant: "destructive" });
      return;
    }
    if (form.password.length < 8) {
      toast({ title: "Parola trebuie să aibă minim 8 caractere", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.firstName, form.lastName);
    setLoading(false);
    if (error) {
      toast({ title: "Eroare la înregistrare", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Cont creat cu succes!",
        description: "Verifică-ți emailul pentru confirmare, apoi autentifică-te.",
      });
      navigate("/login");
    }
  };

  return (
    <Layout>
      <section className="py-24 md:py-32 flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md">
          <div className="border border-border bg-card p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight mb-2">Înregistrare</h1>
              <p className="text-sm text-muted-foreground">Creează un cont nou PrintItForward</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs font-mono uppercase tracking-widest">Prenume</Label>
                  <Input id="firstName" name="firstName" placeholder="Ion" required value={form.firstName} onChange={handleChange} className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs font-mono uppercase tracking-widest">Nume</Label>
                  <Input id="lastName" name="lastName" placeholder="Popescu" required value={form.lastName} onChange={handleChange} className="bg-background border-border" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-mono uppercase tracking-widest">Email</Label>
                <Input id="email" name="email" type="email" placeholder="email@exemplu.ro" required value={form.email} onChange={handleChange} className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-mono uppercase tracking-widest">Parolă</Label>
                <Input id="password" name="password" type="password" placeholder="Minim 8 caractere" required value={form.password} onChange={handleChange} className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-xs font-mono uppercase tracking-widest">Confirmă Parola</Label>
                <Input id="confirm" name="confirm" type="password" placeholder="••••••••" required value={form.confirm} onChange={handleChange} className="bg-background border-border" />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Se creează contul..." : "Creează Cont"}
                <UserPlus className="w-4 h-4" />
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Ai deja cont?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">Autentifică-te</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Register;
