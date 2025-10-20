import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAccessLogger = () => {
  useEffect(() => {
    const logAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        // Get user profile with company
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, company_id, companies(name)")
          .eq("id", user.id)
          .single();

        if (!profile || !profile.company_id) return;

        // Get IP address (this is a simple approach, in production you might want a more reliable method)
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipResponse.json();

        // Log the access
        await supabase.from("platform_access_logs").insert({
          user_id: user.id,
          user_name: profile.full_name,
          company_id: profile.company_id,
          company_name: (profile.companies as any)?.name || "N/A",
          ip_address: ipData.ip || "Unknown",
          user_agent: navigator.userAgent,
        });
      } catch (error) {
        console.error("Error logging access:", error);
      }
    };

    logAccess();
  }, []);
};
