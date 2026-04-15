import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
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
    <AuthSwitch
      loginEmail={loginData.email}
      loginPassword={loginData.password}
      onLoginEmailChange={(v) => setLoginData({ ...loginData, email: v })}
      onLoginPasswordChange={(v) => setLoginData({ ...loginData, password: v })}
      onSignIn={handleLogin}
      registerFullName={registerData.fullName}
      registerCompanyName={registerData.companyName}
      registerEmail={registerData.email}
      registerPassword={registerData.password}
      registerConfirmPassword={registerData.confirmPassword}
      onRegisterFullNameChange={(v) => setRegisterData({ ...registerData, fullName: v })}
      onRegisterCompanyNameChange={(v) => setRegisterData({ ...registerData, companyName: v })}
      onRegisterEmailChange={(v) => setRegisterData({ ...registerData, email: v })}
      onRegisterPasswordChange={(v) => setRegisterData({ ...registerData, password: v })}
      onRegisterConfirmPasswordChange={(v) => setRegisterData({ ...registerData, confirmPassword: v })}
      onSignUp={handleRegister}
      isLoading={isLoading}
      onForgotPassword={() => setIsResetDialogOpen(true)}
    >
      {/* Password Reset Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
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
    </AuthSwitch>
  );
};

export default Login;
