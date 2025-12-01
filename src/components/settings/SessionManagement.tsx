import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  LogOut, 
  Shield,
  MapPin,
  Clock,
  AlertTriangle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Session {
  id: string;
  device_info: {
    deviceType?: string;
    browser?: string;
    os?: string;
    deviceName?: string;
  };
  ip_address: string;
  user_agent: string;
  is_active: boolean;
  last_activity_at: string;
  created_at: string;
  expires_at: string;
}

export function SessionManagement() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("session-manager", {
        body: { action: "list" },
      });

      if (error) throw error;
      setSessions(data.sessions || []);
    } catch (error: any) {
      console.error("Error loading sessions:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le sessioni",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const revokeSession = async (sessionId: string) => {
    try {
      const { error } = await supabase.functions.invoke("session-manager", {
        body: { action: "revoke", sessionId },
      });

      if (error) throw error;

      toast({
        title: "Sessione revocata",
        description: "La sessione è stata terminata con successo",
      });

      loadSessions();
    } catch (error: any) {
      console.error("Error revoking session:", error);
      toast({
        title: "Errore",
        description: "Impossibile revocare la sessione",
        variant: "destructive",
      });
    }
  };

  const revokeAllSessions = async () => {
    try {
      const { error } = await supabase.functions.invoke("session-manager", {
        body: { action: "revoke_all" },
      });

      if (error) throw error;

      toast({
        title: "Sessioni revocate",
        description: "Tutte le altre sessioni sono state terminate",
      });

      loadSessions();
    } catch (error: any) {
      console.error("Error revoking all sessions:", error);
      toast({
        title: "Errore",
        description: "Impossibile revocare le sessioni",
        variant: "destructive",
      });
    }
  };

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType?.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-5 w-5" />;
      case "tablet":
        return <Tablet className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Appena adesso";
    if (diffMins < 60) return `${diffMins} minuti fa`;
    if (diffHours < 24) return `${diffHours} ore fa`;
    if (diffDays < 7) return `${diffDays} giorni fa`;
    return date.toLocaleDateString("it-IT");
  };

  const isExpiringSoon = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry < 2; // Less than 2 hours
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Gestione Sessioni
            </CardTitle>
            <CardDescription>
              Monitora e gestisci le tue sessioni attive su tutti i dispositivi
            </CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={sessions.length <= 1}>
                <LogOut className="h-4 w-4 mr-2" />
                Termina Altre Sessioni
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Conferma Operazione</AlertDialogTitle>
                <AlertDialogDescription>
                  Stai per terminare tutte le altre sessioni attive. Dovrai effettuare nuovamente l'accesso
                  su quegli dispositivi. La sessione corrente rimarrà attiva.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction onClick={revokeAllSessions}>
                  Termina Sessioni
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Caricamento sessioni...
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nessuna sessione attiva
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex gap-4 flex-1">
                  <div className="text-muted-foreground mt-1">
                    {getDeviceIcon(session.device_info.deviceType)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">
                        {session.device_info.deviceName || 
                         session.device_info.browser || 
                         "Dispositivo Sconosciuto"}
                      </h4>
                      {isExpiringSoon(session.expires_at) && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          In scadenza
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      {session.device_info.os && (
                        <div>{session.device_info.os}</div>
                      )}
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {session.ip_address}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Ultimo accesso: {formatDate(session.last_activity_at)}
                        </span>
                      </div>
                      <div className="text-xs">
                        Scade: {new Date(session.expires_at).toLocaleString("it-IT")}
                      </div>
                    </div>
                  </div>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Termina Sessione</AlertDialogTitle>
                      <AlertDialogDescription>
                        Sei sicuro di voler terminare questa sessione? Dovrai effettuare nuovamente
                        l'accesso su questo dispositivo.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annulla</AlertDialogCancel>
                      <AlertDialogAction onClick={() => revokeSession(session.id)}>
                        Termina
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Informazioni sulla Sicurezza
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Le sessioni scadono automaticamente dopo 24 ore di inattività</li>
            <li>Massimo 5 sessioni attive contemporaneamente per account</li>
            <li>Riceverai una notifica per accessi da nuovi dispositivi</li>
            <li>Puoi terminare sessioni sospette in qualsiasi momento</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}