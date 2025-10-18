import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { User, Session } from "@supabase/supabase-js";
import { authService } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  companyId: string | null;
  roles: string[];
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, companyName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const subscription = authService.onAuthStateChange((user, session) => {
      setUser(user);
      setSession(session);
      
      if (user) {
        setTimeout(() => {
          authService.getCurrentUser().then((authUser) => {
            setCompanyId(authUser.companyId);
            setRoles(authUser.roles);
          });
        }, 0);
      } else {
        setCompanyId(null);
        setRoles([]);
      }
    });

    // THEN check for existing session
    authService.getCurrentUser().then((authUser) => {
      setUser(authUser.user);
      setSession(authUser.session);
      setCompanyId(authUser.companyId);
      setRoles(authUser.roles);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, companyName: string) => {
    try {
      await authService.signUp(email, password, fullName, companyName);
      // Reload user data including roles before navigating
      const authUser = await authService.getCurrentUser();
      setCompanyId(authUser.companyId);
      setRoles(authUser.roles);
      navigate("/dashboard");
    } catch (error: any) {
      throw new Error(error.message || "Errore durante la registrazione");
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await authService.signIn(email, password);
      // Reload user data including roles before navigating
      const authUser = await authService.getCurrentUser();
      setCompanyId(authUser.companyId);
      setRoles(authUser.roles);
      navigate("/dashboard");
    } catch (error: any) {
      throw new Error(error.message || "Credenziali non valide");
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      navigate("/");
    } catch (error: any) {
      throw new Error(error.message || "Errore durante il logout");
    }
  };

  const hasRole = (role: string) => roles.includes(role);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        companyId,
        roles,
        loading,
        signUp,
        signIn,
        signOut,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
