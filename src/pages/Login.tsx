import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login - will be replaced with real auth
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Accesso effettuato",
        description: "Benvenuto in PayHub",
      });
      navigate("/dashboard");
    }, 1000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate registration - will be replaced with real auth
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Registrazione completata",
        description: "Account creato con successo",
      });
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <FileText className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">PayHub</h1>
        </div>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle>Benvenuto</CardTitle>
            <CardDescription>
              Accedi o registra la tua azienda per iniziare
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Accedi</TabsTrigger>
                <TabsTrigger value="register">Registrati</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email aziendale</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="hr@azienda.it" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    variant="hero"
                    disabled={isLoading}
                  >
                    {isLoading ? "Accesso in corso..." : "Accedi"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Nome Azienda</Label>
                    <Input 
                      id="company" 
                      placeholder="Azienda S.r.l." 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email aziendale</Label>
                    <Input 
                      id="reg-email" 
                      type="email" 
                      placeholder="hr@azienda.it" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input 
                      id="reg-password" 
                      type="password" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Conferma Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      required 
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    variant="hero"
                    disabled={isLoading}
                  >
                    {isLoading ? "Registrazione in corso..." : "Crea Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => navigate("/")}>
            ← Torna alla home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
