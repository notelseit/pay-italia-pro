import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { User, Session } from "@supabase/supabase-js";
import { authService } from "@/lib/auth";

// Cache configuration
const ROLES_CACHE_KEY = 'auth_roles_cache';
const ROLES_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface RolesCache {
  roles: string[];
  companyId: string | null;
  timestamp: number;
  userId: string;
}

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
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const navigate = useNavigate();

  // Load roles from cache
  const loadRolesFromCache = (userId: string) => {
    try {
      const cached = localStorage.getItem(ROLES_CACHE_KEY);
      if (cached) {
        const cacheData: RolesCache = JSON.parse(cached);
        const isValid = 
          cacheData.userId === userId &&
          Date.now() - cacheData.timestamp < ROLES_CACHE_DURATION;
        
        if (isValid) {
          console.debug('[Auth] Roles loaded from cache', { roles: cacheData.roles });
          return cacheData;
        } else {
          console.debug('[Auth] Cache expired, will fetch fresh roles');
          localStorage.removeItem(ROLES_CACHE_KEY);
        }
      }
    } catch (error) {
      console.debug('[Auth] Error reading roles cache', error);
      localStorage.removeItem(ROLES_CACHE_KEY);
    }
    return null;
  };

  // Save roles to cache
  const saveRolesToCache = (userId: string, roles: string[], companyId: string | null) => {
    try {
      const cacheData: RolesCache = {
        roles,
        companyId,
        timestamp: Date.now(),
        userId
      };
      localStorage.setItem(ROLES_CACHE_KEY, JSON.stringify(cacheData));
      console.debug('[Auth] Roles cached successfully');
    } catch (error) {
      console.debug('[Auth] Error saving roles to cache', error);
    }
  };

  // Clear roles cache
  const clearRolesCache = () => {
    try {
      localStorage.removeItem(ROLES_CACHE_KEY);
      console.debug('[Auth] Roles cache cleared');
    } catch (error) {
      console.debug('[Auth] Error clearing roles cache', error);
    }
  };

  useEffect(() => {
    console.debug('[Auth] Initializing auth provider');
    let timeoutId: ReturnType<typeof setTimeout>;

    // Set up auth state listener FIRST
    const subscription = authService.onAuthStateChange((user, session) => {
      console.debug('[Auth] Auth state changed', { 
        hasUser: !!user, 
        hasSession: !!session 
      });
      
      setUser(user);
      setSession(session);
      
      if (user) {
        console.debug('[Auth] User authenticated, loading roles', { userId: user.id });
        
        // Try to load from cache first
        const cached = loadRolesFromCache(user.id);
        if (cached) {
          setCompanyId(cached.companyId);
          setRoles(cached.roles);
          setIsSuperAdmin(cached.roles.includes('superadmin'));
        }

        // Set timeout for roles loading (10 seconds)
        timeoutId = setTimeout(() => {
          console.warn('[Auth] Roles loading timeout - using cached data or empty roles');
          if (roles.length === 0) {
            console.debug('[Auth] No roles loaded after timeout, setting loading to false');
            setLoading(false);
          }
        }, 10000);

        // Fetch fresh roles in background
        setTimeout(() => {
          authService.getCurrentUser().then((authUser) => {
            console.debug('[Auth] Roles fetched from server', { 
              roles: authUser.roles,
              companyId: authUser.companyId 
            });
            
            setCompanyId(authUser.companyId);
            setRoles(authUser.roles);
            setIsSuperAdmin(authUser.roles.includes('superadmin'));
            
            // Save to cache
            saveRolesToCache(user.id, authUser.roles, authUser.companyId);
            
            // Clear timeout since we got the data
            if (timeoutId) clearTimeout(timeoutId);
          }).catch((error) => {
            console.error('[Auth] Error fetching roles', error);
            // Clear timeout on error too
            if (timeoutId) clearTimeout(timeoutId);
          });
        }, 0);
      } else {
        console.debug('[Auth] User logged out, clearing state');
        setCompanyId(null);
        setRoles([]);
        setIsSuperAdmin(false);
        clearRolesCache();
        if (timeoutId) clearTimeout(timeoutId);
      }
    });

    // THEN check for existing session
    console.debug('[Auth] Checking for existing session');
    authService.getCurrentUser().then((authUser) => {
      console.debug('[Auth] Initial session check complete', { 
        hasUser: !!authUser.user,
        roles: authUser.roles 
      });
      
      setUser(authUser.user);
      setSession(authUser.session);
      
      if (authUser.user) {
        // Check cache first
        const cached = loadRolesFromCache(authUser.user.id);
        if (cached) {
          setCompanyId(cached.companyId);
          setRoles(cached.roles);
          setIsSuperAdmin(cached.roles.includes('superadmin'));
        } else {
          setCompanyId(authUser.companyId);
          setRoles(authUser.roles);
          setIsSuperAdmin(authUser.roles.includes('superadmin'));
          saveRolesToCache(authUser.user.id, authUser.roles, authUser.companyId);
        }
      }
      
      setLoading(false);
    }).catch((error) => {
      console.error('[Auth] Error during initial session check', error);
      setLoading(false);
    });

    return () => {
      console.debug('[Auth] Cleaning up auth provider');
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, companyName: string) => {
    try {
      console.debug('[Auth] Starting sign up process', { email, fullName, companyName });
      await authService.signUp(email, password, fullName, companyName);
      
      // Reload user data including roles before navigating
      const authUser = await authService.getCurrentUser();
      console.debug('[Auth] Sign up successful, roles loaded', { roles: authUser.roles });
      
      setCompanyId(authUser.companyId);
      setRoles(authUser.roles);
      setIsSuperAdmin(authUser.roles.includes('superadmin'));
      
      // Save to cache
      if (authUser.user) {
        saveRolesToCache(authUser.user.id, authUser.roles, authUser.companyId);
      }
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error('[Auth] Sign up error', error);
      throw new Error(error.message || "Errore durante la registrazione");
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.debug('[Auth] Starting sign in process', { email });
      await authService.signIn(email, password);
      
      // Reload user data including roles before navigating
      const authUser = await authService.getCurrentUser();
      console.debug('[Auth] Sign in successful, roles loaded', { 
        roles: authUser.roles,
        isSuperAdmin: authUser.roles.includes('superadmin')
      });
      
      setCompanyId(authUser.companyId);
      setRoles(authUser.roles);
      setIsSuperAdmin(authUser.roles.includes('superadmin'));
      
      // Save to cache
      if (authUser.user) {
        saveRolesToCache(authUser.user.id, authUser.roles, authUser.companyId);
      }
      
      // Redirect superadmin to superadmin panel
      if (authUser.roles.includes('superadmin')) {
        console.debug('[Auth] Redirecting to superadmin panel');
        navigate("/superadmin");
      } else {
        console.debug('[Auth] Redirecting to dashboard');
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error('[Auth] Sign in error', error);
      throw new Error(error.message || "Credenziali non valide");
    }
  };

  const signOut = async () => {
    try {
      console.debug('[Auth] Starting sign out process');
      clearRolesCache();
      await authService.signOut();
      console.debug('[Auth] Sign out successful');
      navigate("/");
    } catch (error: any) {
      console.error('[Auth] Sign out error', error);
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
        isSuperAdmin,
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
