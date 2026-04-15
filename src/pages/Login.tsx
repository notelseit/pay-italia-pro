import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { loginFormSchema, registerFormSchema, getFirstValidationError } from "@/lib/validationSchemas";
import { AuthSwitch } from "@/components/ui/auth-switch";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = loginFormSchema.safeParse(loginData);
    if (!validation.success) {
      toast({ title: "Errore di validazione", description: getFirstValidationError(validation.error), variant: "destructive" });
      return;
    }
    try {
      setIsLoading(true);
      await signIn(loginData.email, loginData.password);
      toast({ title: "Accesso effettuato", description: "Benvenuto in PayHub" });
    } catch (error: any) {
      toast({ title: "Errore", description: error.message || "Credenziali non valide", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = registerFormSchema.safeParse(registerData);
    if (!validation.success) {
      toast({ title: "Errore di validazione", description: getFirstValidationError(validation.error), variant: "destructive" });
      return;
    }
    try {
      setIsLoading(true);
      await signUp(registerData.email, registerData.password, registerData.fullName, registerData.companyName);
      toast({ title: "Registrazione completata", description: "Account creato con successo" });
    } catch (error: any) {
      toast({ title: "Errore", description: error.message || "Errore durante la registrazione", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !z.string().email().safeParse(resetEmail).success) {
      toast({ title: "Errore", description: "Inserisci un'email valida", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({ title: "Email inviata", description: "Controlla la tua casella di posta per il link di reset" });
      setIsResetDialogOpen(false);
      setResetEmail("");
    } catch (error: any) {
      toast({ title: "Errore", description: error.message || "Impossibile inviare l'email di reset", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <FileText className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">PayHub by Notelseit</h1>
        </div>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle>Benvenuto</CardTitle>
            <CardDescription>Accedi o registra la tua azienda per iniziare</CardDescription>
          </CardHeader>
          <CardContent>
            <AuthSwitch mode={mode} onModeChange={setMode} className="mb-6" />

            {mode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email aziendale</Label>
                  <Input id="email" type="email" placeholder="hr@azienda.it" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required />
                </div>
                <Button type="submit" className="w-full" variant="hero" disabled={isLoading}>
                  {isLoading ? "Accesso in corso..." : "Accedi"}
                </Button>
                <div className="text-center mt-4">
                  <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="link" className="text-sm">Password dimenticata?</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Recupera Password</DialogTitle>
                        <DialogDescription>Inserisci la tua email e ti invieremo un link per reimpostare la password</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleForgotPassword} className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="reset-email">Email</Label>
                          <Input id="reset-email" type="email" placeholder="hr@azienda.it" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required />
                        </div>
                        <Button type="submit" className="w-full" variant="hero" disabled={isLoading}>
                          {isLoading ? "Invio in corso..." : "Invia Link di Reset"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input id="fullName" placeholder="Mario Rossi" value={registerData.fullName} onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Nome Azienda</Label>
                  <Input id="company" placeholder="Azienda S.r.l." value={registerData.companyName} onChange={(e) => setRegisterData({ ...registerData, companyName: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email aziendale</Label>
                  <Input id="reg-email" type="email" placeholder="hr@azienda.it" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input id="reg-password" type="password" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Conferma Password</Label>
                  <Input id="confirm-password" type="password" value={registerData.confirmPassword} onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })} required />
                </div>
                <Button type="submit" className="w-full" variant="hero" disabled={isLoading}>
                  {isLoading ? "Registrazione in corso..." : "Crea Account"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => navigate("/")}>← Torna alla home</Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
