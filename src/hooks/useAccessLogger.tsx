import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAccessLogger = () => {
  useEffect(() => {
    const logAccess = async () => {
      try {
        console.log("Starting access log...");
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Error getting user:", userError);
          return;
        }
        
        if (!user) {
          console.log("No user found, skipping access log");
          return;
        }

        console.log("User found:", user.id);

        // Get user profile with company
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, company_id, companies(name)")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error getting profile:", profileError);
          return;
        }

        console.log("Profile found:", profile);

        if (!profile || !profile.company_id) {
          console.log("No profile or company_id, skipping access log");
          return;
        }

        // Get IP address
        let ipAddress = "Unknown";
        try {
          const ipResponse = await fetch("https://api.ipify.org?format=json");
          const ipData = await ipResponse.json();
          ipAddress = ipData.ip || "Unknown";
        } catch (ipError) {
          console.error("Error getting IP:", ipError);
        }

        console.log("Inserting access log...");
        
        // Log the access
        const { data: logData, error: logError } = await supabase
          .from("platform_access_logs")
          .insert({
            user_id: user.id,
            user_name: profile.full_name,
            company_id: profile.company_id,
            company_name: (profile.companies as any)?.name || "N/A",
            ip_address: ipAddress,
            user_agent: navigator.userAgent,
          })
          .select();

        if (logError) {
          console.error("Error inserting access log:", logError);
        } else {
          console.log("Access log inserted successfully:", logData);
        }
      } catch (error) {
        console.error("Error logging access:", error);
      }
    };

    logAccess();
  }, []);
};
