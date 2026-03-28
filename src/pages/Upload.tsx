import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload as UploadIcon, Box, RotateCw, Send } from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const COLORS = [
  { name: "Negru", hex: "#1a1a1a" },
  { name: "Alb", hex: "#f5f5f5" },
  { name: "Roșu", hex: "#ef4444" },
  { name: "Albastru", hex: "#3b82f6" },
  { name: "Verde", hex: "#22c55e" },
  { name: "Galben", hex: "#eab308" },
  { name: "Portocaliu", hex: "#f97316" },
  { name: "Gri", hex: "#6b7280" },
  { name: "Cyan", hex: "#00f0ff" },
  { name: "Roz", hex: "#ec4899" },
];

const UploadPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && (f.name.toLowerCase().endsWith(".stl"))) {
      setFile(f);
    } else {
      toast({ title: "Format invalid", description: "Te rugăm să încarci un fișier .STL", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({ title: "Fișier lipsă", description: "Încarcă un model 3D (.STL)", variant: "destructive" });
      return;
    }
    if (!user) return;
    setLoading(true);

    try {
      // Upload STL to Supabase Storage
      const storagePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("stl-files")
        .upload(storagePath, file);

      let stlUrl: string | null = null;
      if (!uploadError) {
        const { data } = supabase.storage.from("stl-files").getPublicUrl(storagePath);
        stlUrl = data.publicUrl;
      }

      // Create order in DB
      const { error: orderError } = await supabase.from("orders").insert({
        user_id: user.id,
        stl_file_name: file.name,
        stl_file_url: stlUrl,
        color_name: selectedColor.name,
        color_hex: selectedColor.hex,
        quantity: parseInt(quantity),
        notes,
        status: "pending",
      });

      if (orderError) throw orderError;

      toast({
        title: "Comandă trimisă!",
        description: "Vei primi un email cu oferta de preț în cel mai scurt timp.",
      });

      // Reset
      setFile(null);
      setQuantity("1");
      setNotes("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "A apărut o eroare.";
      toast({ title: "Eroare", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-primary mb-4 block">
              Printare Custom
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Încarcă Modelul 3D
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Trimite-ne fișierul STL, alege culoarea și cantitatea. Primești oferta în câteva ore.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* STL Viewer */}
              <div className="lg:col-span-3">
                <div className="border border-border bg-card aspect-[4/3] flex flex-col items-center justify-center relative overflow-hidden">
                  {file ? (
                    <div className="flex flex-col items-center gap-4 p-8 text-center">
                      <div
                        className="w-32 h-32 border border-primary/30 flex items-center justify-center"
                        style={{ backgroundColor: selectedColor.hex + "15" }}
                      >
                        <Box className="w-16 h-16" style={{ color: selectedColor.hex }} />
                      </div>
                      <div>
                        <p className="font-mono text-sm text-foreground">{file.name}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                      >
                        <RotateCw className="w-4 h-4" />
                        Schimbă fișierul
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex flex-col items-center gap-4 p-8 cursor-pointer hover:bg-muted/30 transition-colors w-full h-full justify-center"
                    >
                      <div className="w-20 h-20 border-2 border-dashed border-border flex items-center justify-center">
                        <UploadIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-foreground">Trage fișierul aici sau click pentru a încărca</p>
                        <p className="text-xs text-muted-foreground font-mono mt-1">Format acceptat: .STL (max 50MB)</p>
                      </div>
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept=".stl" onChange={handleFileChange} className="hidden" />
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-2 space-y-8">
                <div className="border border-border p-6 bg-card">
                  <Label className="text-xs font-mono uppercase tracking-widest block mb-4">
                    Culoare Filament
                  </Label>
                  <div className="grid grid-cols-5 gap-3">
                    {COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className={`w-full aspect-square border-2 transition-all duration-150 ${
                          selectedColor.hex === c.hex
                            ? "border-primary scale-110"
                            : "border-border hover:border-muted-foreground"
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-3">
                    Selectat: {selectedColor.name}
                  </p>
                </div>

                <div className="border border-border p-6 bg-card">
                  <Label htmlFor="qty" className="text-xs font-mono uppercase tracking-widest block mb-3">
                    Cantitate
                  </Label>
                  <Input
                    id="qty"
                    type="number"
                    min="1"
                    max="10000"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="bg-background border-border font-mono"
                  />
                </div>

                <div className="border border-border p-6 bg-card">
                  <Label htmlFor="notes" className="text-xs font-mono uppercase tracking-widest block mb-3">
                    Observații
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Specificații suplimentare..."
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-background border-border resize-none"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? "Se trimite..." : "Trimite Comanda"}
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default UploadPage;
