import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: string[];
}

export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
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

  // Wait for roles to load before checking permissions
  if (requireRole) {
    // If user exists but roles are empty and not explicitly set, still loading
    if (roles.length === 0 && user) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    // Only show access denied if roles are loaded but user doesn't have required role
    if (!requireRole.some(role => roles.includes(role))) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2 text-foreground">Accesso Negato</h1>
            <p className="text-muted-foreground">Non hai i permessi necessari per accedere a questa pagina.</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
