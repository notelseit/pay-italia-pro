import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export interface AuthUser {
  user: User | null;
  session: Session | null;
  companyId: string | null;
  roles: string[];
}

export const authService = {
  async signUp(email: string, password: string, fullName: string, companyName: string) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Registrazione fallita");

    // Use security definer function to create company, assign it to user, and set admin role
    const { data: companyId, error: companyError } = await supabase
      .rpc("create_company_for_user", {
        _user_id: authData.user.id,
        _company_name: companyName,
        _company_email: email,
      });

    if (companyError) throw companyError;

    return { user: authData.user, session: authData.session };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<AuthUser> {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user || null;
    
    if (!user) {
      return { user: null, session: null, companyId: null, roles: [] };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    return {
      user,
      session,
      companyId: profile?.company_id || null,
      roles: userRoles?.map(r => r.role) || [],
    };
  },

  onAuthStateChange(callback: (user: User | null, session: Session | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        callback(session?.user ?? null, session);
      }
    );
    return subscription;
  },
};
