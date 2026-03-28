import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const ProfileSettings = () => {
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
    city: profile?.city || "",
    postal_code: profile?.postal_code || "",
  });

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update(form)
      .eq("id", user.id);
    setLoading(false);
    if (error) {
      toast({ title: "Eroare", description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Profil actualizat!", description: "Modificările au fost salvate." });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) {
      toast({ title: "Parolele nu coincid", variant: "destructive" }); return;
    }
    if (pw.next.length < 8) {
      toast({ title: "Parola trebuie să aibă minim 8 caractere", variant: "destructive" }); return;
    }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw.next });
    setPwLoading(false);
    if (error) {
      toast({ title: "Eroare la schimbarea parolei", description: error.message, variant: "destructive" });
    } else {
      setPw({ current: "", next: "", confirm: "" });
      toast({ title: "Parola a fost schimbată!" });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Format invalid", description: "Selectează o imagine.", variant: "destructive" }); return;
    }
    setAvatarLoading(true);
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Eroare upload", description: uploadError.message, variant: "destructive" });
      setAvatarLoading(false); return;
    }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
    await refreshProfile();
    toast({ title: "Avatar actualizat!" });
    setAvatarLoading(false);
  };

  return (
    <Layout>
      <section className="py-24 md:py-32">
        <div className="container max-w-2xl">
          <Link to="/profile" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Înapoi la profil
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Setări Profil</h1>
            <p className="text-sm text-muted-foreground">Actualizează informațiile contului tău</p>
          </div>

          {/* Avatar */}
          <div className="border border-border bg-card p-6 mb-6">
            <h2 className="font-semibold text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
              Fotografie Profil
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 border border-border bg-muted flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl text-muted-foreground font-bold">
                    {profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || "?"}
                  </span>
                )}
              </div>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={avatarLoading}
                  onClick={() => avatarRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {avatarLoading ? "Se încarcă..." : "Schimbă poza"}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, max 2MB</p>
                <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </div>
            </div>
          </div>

          {/* Personal info */}
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="border border-border bg-card p-6 space-y-5">
              <h2 className="font-semibold text-sm font-mono uppercase tracking-widest text-muted-foreground">
                Informații Personale
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-mono uppercase tracking-widest">Prenume</Label>
                  <Input name="first_name" value={form.first_name} onChange={handleChange} className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-mono uppercase tracking-widest">Nume</Label>
                  <Input name="last_name" value={form.last_name} onChange={handleChange} className="bg-background border-border" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase tracking-widest">Email</Label>
                <Input type="email" value={user?.email || ""} disabled className="bg-background border-border opacity-60" />
                <p className="text-xs text-muted-foreground">Email-ul nu poate fi schimbat din această pagină.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase tracking-widest">Telefon</Label>
                <Input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+40 712 345 678" className="bg-background border-border" />
              </div>
            </div>

            <div className="border border-border bg-card p-6 space-y-5">
              <h2 className="font-semibold text-sm font-mono uppercase tracking-widest text-muted-foreground">
                Adresă de Livrare
              </h2>
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase tracking-widest">Adresă</Label>
                <Input name="address" value={form.address} onChange={handleChange} placeholder="Str. Exemplu nr. 10" className="bg-background border-border" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-mono uppercase tracking-widest">Oraș</Label>
                  <Input name="city" value={form.city} onChange={handleChange} placeholder="București" className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-mono uppercase tracking-widest">Cod Poștal</Label>
                  <Input name="postal_code" value={form.postal_code} onChange={handleChange} placeholder="010101" className="bg-background border-border" />
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" disabled={loading}>
              {loading ? "Se salvează..." : "Salvează Modificările"}
              <Save className="w-4 h-4" />
            </Button>
          </form>

          {/* Change password */}
          <form onSubmit={handleChangePassword} className="mt-6 space-y-6">
            <div className="border border-border bg-card p-6 space-y-5">
              <h2 className="font-semibold text-sm font-mono uppercase tracking-widest text-muted-foreground">
                Schimbă Parola
              </h2>
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase tracking-widest">Parolă Nouă</Label>
                <Input type="password" placeholder="Minim 8 caractere" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase tracking-widest">Confirmă Parola Nouă</Label>
                <Input type="password" placeholder="••••••••" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} className="bg-background border-border" />
              </div>
              <Button type="submit" variant="outline" size="lg" disabled={pwLoading}>
                {pwLoading ? "Se schimbă..." : "Schimbă Parola"}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default ProfileSettings;
