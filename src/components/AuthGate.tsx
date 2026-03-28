import { useAuth } from '@/contexts/AuthContext';

/**
 * Blochează render-ul întregii aplicații până când sesiunea Supabase
 * e complet restaurată din localStorage după un refresh de pagină.
 * Fără asta, componentele fac fetch cu sesiune null și primesc erori RLS.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Se încarcă...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
