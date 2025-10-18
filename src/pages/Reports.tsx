import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";

const Reports = () => {
  const reports = [
    {
      title: "Costo del Lavoro Mensile",
      description: "Analisi dettagliata del costo del lavoro per novembre 2024",
      date: "30 Nov 2024",
      type: "Mensile",
      status: "Disponibile"
    },
    {
      title: "Riepilogo Contributi Q4",
      description: "Sommario contributi INPS e IRPEF ottobre-dicembre 2024",
      date: "31 Dic 2024",
      type: "Trimestrale",
      status: "In Generazione"
    },
    {
      title: "Report Assenze Novembre",
      description: "Analisi ferie, malattie e permessi del mese",
      date: "30 Nov 2024",
      type: "Mensile",
      status: "Disponibile"
    },
    {
      title: "Scadenze Fiscali Dicembre",
      description: "Calendario pagamenti INPS, IRPEF e F24",
      date: "1 Dic 2024",
      type: "Scadenzario",
      status: "Disponibile"
    }
  ];

  const upcomingDeadlines = [
    {
      task: "Versamento INPS",
      date: "16 Dic 2024",
      amount: "€28,400",
      priority: "Alta"
    },
    {
      task: "Versamento IRPEF (Modello F24)",
      date: "16 Dic 2024",
      amount: "€71,000",
      priority: "Alta"
    },
    {
      task: "Comunicazioni UniEmens",
      date: "31 Dic 2024",
      amount: "-",
      priority: "Media"
    },
    {
      task: "Report Costo Lavoro Q4",
      date: "31 Dic 2024",
      amount: "-",
      priority: "Media"
    }
  ];

  const complianceStatus = [
    { item: "GDPR - Privacy Dipendenti", status: "Conforme", lastCheck: "15 Nov 2024" },
    { item: "Registri Obbligatori", status: "Conforme", lastCheck: "20 Nov 2024" },
    { item: "Documenti Valutazione Rischi", status: "In Scadenza", lastCheck: "01 Ott 2024" },
    { item: "Visite Mediche Periodiche", status: "Conforme", lastCheck: "10 Nov 2024" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Report e Compliance</h1>
          <p className="text-muted-foreground">Analisi, scadenze e conformità normativa</p>
        </div>

        {/* Upcoming Deadlines Alert */}
        <Card className="mb-6 border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Scadenze Imminenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.slice(0, 2).map((deadline, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{deadline.task}</p>
                    <p className="text-sm text-muted-foreground">Scadenza: {deadline.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{deadline.amount}</p>
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                      {deadline.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Available Reports */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Report Disponibili</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-foreground">{report.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {report.date}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {report.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="ml-4">
                    {report.status === "Disponibile" ? (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Scarica
                      </Button>
                    ) : (
                      <Badge variant="outline" className="bg-muted text-muted-foreground">
                        {report.status}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* All Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle>Calendario Scadenze</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingDeadlines.map((deadline, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{deadline.task}</p>
                      <p className="text-xs text-muted-foreground">{deadline.date}</p>
                    </div>
                    <div className="text-right">
                      {deadline.amount !== "-" && (
                        <p className="text-sm font-semibold text-foreground mb-1">{deadline.amount}</p>
                      )}
                      <Badge 
                        variant="outline" 
                        className={
                          deadline.priority === "Alta" 
                            ? "bg-destructive/10 text-destructive border-destructive/20" 
                            : "bg-primary/10 text-primary border-primary/20"
                        }
                      >
                        {deadline.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Compliance Status */}
          <Card>
            <CardHeader>
              <CardTitle>Stato Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {complianceStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.item}</p>
                      <p className="text-xs text-muted-foreground">
                        Ultimo controllo: {item.lastCheck}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        item.status === "Conforme" 
                          ? "bg-primary/10 text-primary border-primary/20" 
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* GDPR Info */}
        <Card className="mt-6 bg-accent/30">
          <CardHeader>
            <CardTitle className="text-sm">Conformità GDPR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              PayHub garantisce la piena conformità al GDPR per la gestione dei dati personali dei dipendenti. 
              Tutti i dati sono crittografati, con accesso basato sui ruoli e log di audit completi. 
              I dipendenti possono accedere, modificare o richiedere la cancellazione dei propri dati in qualsiasi momento.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Reports;
