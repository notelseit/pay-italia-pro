import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Shield, Clock, FileText, Users, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-payroll.jpg";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Gestione Dipendenti",
      description: "Anagrafica completa con codici fiscali, contratti e documenti",
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Presenze e Assenze",
      description: "Tracciamento ferie, malattie e permessi con importazione automatica",
    },
    {
      icon: <FileText className="h-6 w-6 text-primary" />,
      title: "Cedolini Automatici",
      description: "Calcolo automatico INPS e IRPEF secondo normativa italiana",
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Compliance GDPR",
      description: "Piena conformità alle normative sulla privacy e sicurezza dati",
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-primary" />,
      title: "Report Dettagliati",
      description: "Analisi costo del lavoro e scadenze fiscali in tempo reale",
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
      title: "Multi-tenant",
      description: "Ogni azienda con dati isolati e configurazioni personalizzate",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm fixed top-0 w-full z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground"><h1 className="text-2xl font-bold text-foreground">PayHub by Notelseit</h1></h1>
          </div>
          <Button variant="hero" onClick={() => navigate("/login")}>
            Accedi
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-5xl font-bold leading-tight text-foreground">
                Gestione Payroll <br /> Gestione Payroll <br /> by Notelseit
                <span className="block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Semplice e Conforme
                </span>
              </h2>
              <p className="text-xl text-muted-foreground">
                La piattaforma SaaS completa per HR manager che automatizza cedolini, contributi e conformità alle
                normative italiane del lavoro.
              </p>
              <div className="flex gap-4">
                <Button variant="hero" size="lg" onClick={() => navigate("/login")}>
                  Inizia Ora
                </Button>
                <Button variant="outline" size="lg">
                  Scopri di Più
                </Button>
              </div>
            </div>
            <div className="relative">
              <img src={heroImage} alt="Professional HR team working" className="rounded-2xl shadow-elevated w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4 text-foreground">
              Tutto quello che ti serve per la gestione del personale
            </h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Una soluzione completa per semplificare i processi HR e garantire la conformità normativa
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-elevated transition-all duration-300 border-border bg-card">
                <div className="mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold mb-2 text-card-foreground">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="p-12 text-center bg-gradient-to-br from-primary/10 to-accent/50 border-primary/20">
            <h3 className="text-3xl font-bold mb-4 text-foreground">
              Pronto a semplificare la gestione del personale?
            </h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Unisciti alle aziende che hanno già automatizzato i loro processi payroll
            </p>
            <Button variant="hero" size="lg" onClick={() => navigate("/login")}>
              Inizia Gratuitamente
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 bg-card">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>
            © 2025 PayHub by UNILAB GROUP S.R.L.S. Tutti i diritti riservati. P.IVA 03436460731 - Piazzale Dante, 26,
            74121, Taranto (TA)
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
