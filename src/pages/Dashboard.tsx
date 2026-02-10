import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Calendar, FileText, AlertTriangle, TrendingUp, Stethoscope, ClipboardCheck, History } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays } from "date-fns";
import { it } from "date-fns/locale";

const Dashboard = () => {
  const navigate = useNavigate();
  const { companyId, hasRole } = useAuth();
  const isMedicalOfficerOnly = hasRole('medical_officer') && !hasRole('admin') && !hasRole('superadmin') && !hasRole('admin_sub_azienda') && !hasRole('hr_manager');
  const {
    employeesCount,
    unvalidatedPresence,
    payrollStats,
    recentActivity,
    newEmployeesThisMonth,
  } = useDashboard(companyId || undefined);

  // Medical officer health stats
  const { data: healthStats } = useQuery({
    queryKey: ['medical-officer-dashboard', companyId],
    queryFn: async () => {
      if (!companyId) return null;
      const { count: activeRecords } = await supabase
        .from('medical_records')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'active');

      const { count: scheduledVisits } = await supabase
        .from('medical_visits')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'scheduled');

      const today = new Date();
      const thirtyDaysFromNow = addDays(today, 30);
      const { data: expiringJudgments } = await supabase
        .from('fitness_judgments')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .not('expiry_date', 'is', null)
        .gte('expiry_date', format(today, 'yyyy-MM-dd'))
        .lte('expiry_date', format(thirtyDaysFromNow, 'yyyy-MM-dd'));

      return {
        activeRecords: activeRecords || 0,
        scheduledVisits: scheduledVisits || 0,
        expiringJudgments: expiringJudgments?.length || 0,
      };
    },
    enabled: !!companyId && isMedicalOfficerOnly,
  });

  const currentMonth = format(new Date(), "MMMM yyyy", { locale: it });

  const stats = [
    {
      title: "Dipendenti Attivi",
      value: employeesCount.toString(),
      icon: <Users className="h-6 w-6 text-primary" />,
      trend: newEmployeesThisMonth > 0 ? `+${newEmployeesThisMonth} questo mese` : "Nessun nuovo dipendente"
    },
    {
      title: "Presenze da Validare",
      value: unvalidatedPresence.toString(),
      icon: <Calendar className="h-6 w-6 text-primary" />,
      trend: unvalidatedPresence > 0 ? "Da verificare" : "Tutto validato"
    },
    {
      title: "Cedolini Generati",
      value: `${payrollStats.generated}/${payrollStats.total}`,
      icon: <FileText className="h-6 w-6 text-primary" />,
      trend: payrollStats.pending > 0 ? `${payrollStats.pending} in sospeso` : "Tutti completati"
    },
    {
      title: "Mese Corrente",
      value: format(new Date(), "MMM yyyy", { locale: it }),
      icon: <AlertTriangle className="h-6 w-6 text-primary" />,
      trend: currentMonth
    }
  ];

  const upcomingTasks = [
    { 
      task: `Invio cedolini ${format(new Date(), "MMMM", { locale: it })}`, 
      deadline: format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), "d MMM yyyy", { locale: it }), 
      priority: "Alta" 
    },
    { 
      task: "Pagamento INPS", 
      deadline: format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 16), "d MMM yyyy", { locale: it }), 
      priority: "Alta" 
    },
    { 
      task: "Report costo lavoro", 
      deadline: format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), "d MMM yyyy", { locale: it }), 
      priority: "Media" 
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            {isMedicalOfficerOnly ? "Panoramica Sorveglianza Sanitaria" : "Panoramica delle attività HR"}
          </p>
        </div>

        {isMedicalOfficerOnly ? (
          <>
            {/* Medical Officer Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="hover:shadow-elevated transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Cartelle Attive</CardTitle>
                  <FileText className="h-6 w-6 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1 text-foreground">{healthStats?.activeRecords || 0}</div>
                  <p className="text-xs text-muted-foreground">In gestione</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-elevated transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Visite Programmate</CardTitle>
                  <Stethoscope className="h-6 w-6 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1 text-foreground">{healthStats?.scheduledVisits || 0}</div>
                  <p className="text-xs text-muted-foreground">Da completare</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-elevated transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Giudizi in Scadenza</CardTitle>
                  <ClipboardCheck className="h-6 w-6 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1 text-foreground">{healthStats?.expiringJudgments || 0}</div>
                  <p className="text-xs text-muted-foreground">Prossimi 30 giorni</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Azioni Rapide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/health-surveillance")}>
                  <Stethoscope className="mr-2 h-4 w-4" />
                  Sorveglianza Sanitaria
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/employees")}>
                  <Users className="mr-2 h-4 w-4" />
                  Elenco Dipendenti
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-elevated transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    {stat.icon}
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-1 text-foreground">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.trend}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Azioni Rapide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/employees")}>
                    <Users className="mr-2 h-4 w-4" />
                    Gestisci Dipendenti
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/presence")}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Registra Presenze
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/payroll")}>
                    <FileText className="mr-2 h-4 w-4" />
                    Genera Cedolini
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/reports")}>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Visualizza Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Scadenze Imminenti</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingTasks.map((task, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{task.task}</p>
                          <p className="text-sm text-muted-foreground">{task.deadline}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          task.priority === "Alta" 
                            ? "bg-destructive/20 text-destructive" 
                            : "bg-primary/20 text-primary"
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Attività Recenti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium text-foreground">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.employee}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
