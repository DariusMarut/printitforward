import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const Contact = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: profile ? `${profile.first_name} ${profile.last_name}`.trim() : "",
    email: user?.email || "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name,
      email: form.email,
      subject: form.subject,
      message: form.message,
      user_id: user?.id || null,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Eroare", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Mesaj trimis!", description: "Îți vom răspunde în cel mai scurt timp." });
      setForm({ name: "", email: "", subject: "", message: "" });
    }
  };

  return (
    <Layout>
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-primary mb-4 block">
              Contact
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Hai să vorbim
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Ai întrebări sau vrei o ofertă personalizată? Scrie-ne și îți răspundem rapid.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-mono uppercase tracking-widest">Nume</Label>
                  <Input id="name" name="name" placeholder="Ion Popescu" required value={form.name} onChange={handleChange} className="bg-card border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-mono uppercase tracking-widest">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="ion@exemplu.ro" required value={form.email} onChange={handleChange} className="bg-card border-border" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-xs font-mono uppercase tracking-widest">Subiect</Label>
                <Input id="subject" name="subject" placeholder="Ofertă producție serie" required value={form.subject} onChange={handleChange} className="bg-card border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-xs font-mono uppercase tracking-widest">Mesaj</Label>
                <Textarea id="message" name="message" placeholder="Descrie proiectul tău..." rows={6} required value={form.message} onChange={handleChange} className="bg-card border-border resize-none" />
              </div>
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? "Se trimite..." : "Trimite Mesajul"}
                <Send className="w-4 h-4" />
              </Button>
            </form>

            <div className="lg:col-span-2 space-y-8">
              <div className="border border-border p-6 bg-card">
                <h3 className="font-semibold mb-4">Informații Contact</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">contact@printitforward.ro</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Telefon</p>
                      <p className="text-sm text-muted-foreground">+40 123 456 789</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Sediu</p>
                      <p className="text-sm text-muted-foreground">Bd. Iuliu Maniu, nr.39-41, Arad</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-border p-6 bg-card">
                <h3 className="font-semibold mb-2">Program</h3>
                <div className="space-y-1 text-sm font-mono text-muted-foreground">
                  <p>Luni — Vineri: 08:00 — 18:00</p>
                  <p>Sâmbătă: 09:00 — 14:00</p>
                  <p>Duminică: Închis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
