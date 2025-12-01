import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: string[];
}

export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const [showTimeout, setShowTimeout] = useState(false);

  // Safety timeout for role loading (15 seconds)
  useEffect(() => {
    if (user && requireRole && roles.length === 0 && !loading) {
      const timeoutId = setTimeout(() => {
        console.warn('[ProtectedRoute] Role loading timeout, showing error');
        setShowTimeout(true);
      }, 15000);

      return () => clearTimeout(timeoutId);
    } else {
      setShowTimeout(false);
    }
  }, [user, roles, loading, requireRole]);

  useEffect(() => {
    console.debug('[ProtectedRoute] State', { 
      hasUser: !!user, 
      loading, 
      rolesCount: roles.length,
      requireRole 
    });
    
    if (!loading && !user) {
      console.debug('[ProtectedRoute] No user, redirecting to login');
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Show timeout error if roles didn't load
  if (showTimeout) {
    console.error('[ProtectedRoute] Timeout error displayed');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-6">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-foreground">Errore di Caricamento</h1>
          <p className="text-muted-foreground mb-4">
            Non è stato possibile caricare i permessi utente. Riprova ad accedere.
          </p>
          <Button 
            onClick={() => {
              console.debug('[ProtectedRoute] Retry button clicked');
              navigate("/login");
            }}
          >
            Torna al Login
          </Button>
        </div>
      </div>
    );
  }

  // Wait for roles to load before checking permissions
  if (requireRole) {
    // If user exists but roles are empty and not explicitly set, still loading
    if (roles.length === 0 && user) {
      console.debug('[ProtectedRoute] Waiting for roles to load');
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Caricamento permessi...</p>
          </div>
        </div>
      );
    }
    
    // Only show access denied if roles are loaded but user doesn't have required role
    if (!requireRole.some(role => roles.includes(role))) {
      console.warn('[ProtectedRoute] Access denied', { 
        userRoles: roles, 
        requiredRoles: requireRole 
      });
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2 text-foreground">Accesso Negato</h1>
            <p className="text-muted-foreground">Non hai i permessi necessari per accedere a questa pagina.</p>
          </div>
        </div>
      );
    } else {
      console.debug('[ProtectedRoute] Access granted', { 
        userRoles: roles, 
        requiredRoles: requireRole 
      });
    }
  }

  return <>{children}</>;
}
