import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Calendar, FileText, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import Navbar from "@/components/Navbar";

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Dipendenti Attivi",
      value: "142",
      icon: <Users className="h-6 w-6 text-primary" />,
      trend: "+8 questo mese"
    },
    {
      title: "Presenze da Validare",
      value: "23",
      icon: <Calendar className="h-6 w-6 text-primary" />,
      trend: "Per novembre 2024"
    },
    {
      title: "Cedolini Generati",
      value: "138/142",
      icon: <FileText className="h-6 w-6 text-primary" />,
      trend: "4 in sospeso"
    },
    {
      title: "Alert Compliance",
      value: "2",
      icon: <AlertTriangle className="h-6 w-6 text-destructive" />,
      trend: "Scadenze imminenti"
    }
  ];

  const recentActivity = [
    { action: "Cedolino generato", employee: "Mario Rossi", time: "2 ore fa" },
    { action: "Assenza registrata", employee: "Laura Bianchi", time: "4 ore fa" },
    { action: "Nuovo dipendente", employee: "Giuseppe Verdi", time: "Ieri" },
    { action: "Contributi calcolati", employee: "Anna Neri", time: "Ieri" },
  ];

  const upcomingTasks = [
    { task: "Invio cedolini novembre", deadline: "30 Nov 2024", priority: "Alta" },
    { task: "Pagamento INPS", deadline: "16 Dic 2024", priority: "Alta" },
    { task: "Report costo lavoro Q4", deadline: "31 Dic 2024", priority: "Media" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Panoramica delle attività HR</p>
        </div>

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
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Azioni Rapide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/employees")}
              >
                <Users className="mr-2 h-4 w-4" />
                Gestisci Dipendenti
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/presence")}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Registra Presenze
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/payroll")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Genera Cedolini
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/reports")}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Visualizza Report
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
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

        {/* Recent Activity */}
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
      </main>
    </div>
  );
};

export default Dashboard;
