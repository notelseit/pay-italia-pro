import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Stethoscope, 
  Calendar, 
  FileText, 
  AlertTriangle, 
  ClipboardCheck,
  UserCheck,
  Plus,
  CalendarClock,
  Settings,
  ChevronDown,
  History
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, isBefore, addDays, startOfDay, endOfDay } from "date-fns";
import { it } from "date-fns/locale";
import { MedicalVisitDialog } from "@/components/health-surveillance/MedicalVisitDialog";
import { MedicalRecordDialog } from "@/components/health-surveillance/MedicalRecordDialog";
import { ProtocolManagementDialog } from "@/components/health-surveillance/ProtocolManagementDialog";
import { FitnessJudgmentDialog } from "@/components/health-surveillance/FitnessJudgmentDialog";
import { JobRoleProtocolDialog } from "@/components/health-surveillance/JobRoleProtocolDialog";
import { NotificationTestButton } from "@/components/health-surveillance/NotificationTestButton";
import { MedicalVisitCalendar } from "@/components/health-surveillance/MedicalVisitCalendar";
import { NotificationSettingsDialog } from "@/components/health-surveillance/NotificationSettingsDialog";
import { NotificationLogsDialog } from "@/components/health-surveillance/NotificationLogsDialog";
import { MedicalRecordListDialog } from "@/components/health-surveillance/MedicalRecordListDialog";
import { MedicalVisitListDialog } from "@/components/health-surveillance/MedicalVisitListDialog";
import { DVRRiskManagement } from "@/components/health-surveillance/DVRRiskManagement";
import { MedicalTimelineDialog } from "@/components/health-surveillance/MedicalTimelineDialog";

const HealthSurveillance = () => {
  const navigate = useNavigate();
  const { companyId, hasRole } = useAuth();
  const isEmployee = hasRole('employee') && !hasRole('admin') && !hasRole('hr_manager') && !hasRole('medical_officer');

  const [visitDialogOpen, setVisitDialogOpen] = useState(false);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [protocolDialogOpen, setProtocolDialogOpen] = useState(false);
  const [judgmentDialogOpen, setJudgmentDialogOpen] = useState(false);
  const [jobRoleProtocolDialogOpen, setJobRoleProtocolDialogOpen] = useState(false);
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false);
  const [notificationLogsOpen, setNotificationLogsOpen] = useState(false);
  const [recordListOpen, setRecordListOpen] = useState(false);
  const [visitListOpen, setVisitListOpen] = useState(false);
  const [dvrRisksOpen, setDvrRisksOpen] = useState(false);
  const [timelineDialogOpen, setTimelineDialogOpen] = useState(false);
  const [prefilledEmployeeId, setPrefilledEmployeeId] = useState<string | undefined>();

  // Fetch dashboard stats
  const { data: dashboardStats } = useQuery({
    queryKey: ['health-surveillance-stats', companyId],
    queryFn: async () => {
      if (!companyId) return null;

      // Conta le cartelle sanitarie attive
      const { count: activeRecords } = await supabase
        .from('medical_records')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'active');

      // Conta le visite programmate
      const { count: scheduledVisits } = await supabase
        .from('medical_visits')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'scheduled');

      // Visite in scadenza (prossimi 30 giorni)
      const today = new Date();
      const thirtyDaysFromNow = addDays(today, 30);
      
      const { data: expiringVisits } = await supabase
        .from('medical_visits')
        .select('*, employees(full_name)')
        .eq('company_id', companyId)
        .eq('status', 'scheduled')
        .gte('scheduled_date', format(today, 'yyyy-MM-dd'))
        .lte('scheduled_date', format(thirtyDaysFromNow, 'yyyy-MM-dd'))
        .order('scheduled_date', { ascending: true })
        .limit(5);

      // Appuntamenti di oggi
      const { data: todayAppointments } = await supabase
        .from('medical_visits')
        .select('*, employees(full_name)')
        .eq('company_id', companyId)
        .eq('status', 'scheduled')
        .eq('scheduled_date', format(today, 'yyyy-MM-dd'))
        .order('scheduled_date', { ascending: true });

      // Giudizi di idoneità in scadenza (prossimi 60 giorni)
      const sixtyDaysFromNow = addDays(today, 60);
      
      const { data: expiringJudgments } = await supabase
        .from('fitness_judgments')
        .select('*, employees(full_name)')
        .eq('company_id', companyId)
        .not('expiry_date', 'is', null)
        .gte('expiry_date', format(today, 'yyyy-MM-dd'))
        .lte('expiry_date', format(sixtyDaysFromNow, 'yyyy-MM-dd'))
        .order('expiry_date', { ascending: true })
        .limit(5);

      return {
        activeRecords: activeRecords || 0,
        scheduledVisits: scheduledVisits || 0,
        expiringVisits: expiringVisits || [],
        todayAppointments: todayAppointments || [],
        expiringJudgments: expiringJudgments || [],
      };
    },
    enabled: !!companyId,
  });

  const stats = [
    {
      title: "Cartelle Sanitarie Attive",
      value: dashboardStats?.activeRecords?.toString() || "0",
      icon: <FileText className="h-6 w-6 text-primary" />,
      trend: "In gestione"
    },
    {
      title: "Visite Programmate",
      value: dashboardStats?.scheduledVisits?.toString() || "0",
      icon: <Calendar className="h-6 w-6 text-primary" />,
      trend: "Da completare"
    },
    {
      title: "Visite in Scadenza",
      value: dashboardStats?.expiringVisits?.length?.toString() || "0",
      icon: <AlertTriangle className="h-6 w-6 text-primary" />,
      trend: "Prossimi 30 giorni"
    },
    {
      title: "Appuntamenti Oggi",
      value: dashboardStats?.todayAppointments?.length?.toString() || "0",
      icon: <CalendarClock className="h-6 w-6 text-primary" />,
      trend: format(new Date(), "d MMMM yyyy", { locale: it })
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-foreground">Sorveglianza Sanitaria</h1>
              <p className="text-muted-foreground">
                Gestione visite mediche, protocolli sanitari e monitoraggio idoneità secondo D.Lgs. 81/08 e D.Lgs. 101/20
              </p>
            </div>
            {!isEmployee && <NotificationTestButton />}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="hover:shadow-elevated transition-all duration-300 cursor-pointer"
              onClick={() => {
                if (index === 0) setRecordListOpen(true);
                if (index === 1 || index === 2) setVisitListOpen(true);
              }}
            >
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

        {/* Calendario Visite */}
        <div className="mb-8">
          <MedicalVisitCalendar 
            companyId={companyId} 
            onVisitClick={(visit) => {
              console.log('Visit clicked:', visit);
              setVisitListOpen(true);
            }}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Quick Actions */}
          {!isEmployee && (
            <Card>
              <CardHeader>
                <CardTitle>Azioni Rapide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setVisitDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nuova Visita Medica
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setRecordDialogOpen(true)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Nuova Cartella Sanitaria
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setTimelineDialogOpen(true)}
                >
                  <History className="mr-2 h-4 w-4" />
                  Timeline Sanitaria
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Gestione e Configurazioni
                      <ChevronDown className="ml-auto h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    <DropdownMenuLabel>Gestione Sanitaria</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setProtocolDialogOpen(true)}>
                      <Stethoscope className="mr-2 h-4 w-4" />
                      Gestione Protocolli
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setJudgmentDialogOpen(true)}>
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      Giudizi di Idoneità
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setJobRoleProtocolDialogOpen(true)}>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Mansioni e Protocolli
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDvrRisksOpen(true)}>
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Gestione Rischi DVR
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuLabel>Notifiche</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setNotificationSettingsOpen(true)}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Configurazione Notifiche
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setNotificationLogsOpen(true)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Storico Notifiche
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          )}

          {/* Appuntamenti di Oggi */}
          <Card>
            <CardHeader>
              <CardTitle>Appuntamenti di Oggi</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardStats?.todayAppointments && dashboardStats.todayAppointments.length > 0 ? (
                <div className="space-y-3">
                  {dashboardStats.todayAppointments.map((visit: any) => (
                    <div key={visit.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-primary" />
                        <div>
                          <p className="font-medium text-sm">{visit.employees?.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {visit.visit_type === 'preventiva' && 'Visita Preventiva'}
                            {visit.visit_type === 'periodica' && 'Visita Periodica'}
                            {visit.visit_type === 'cambio_mansione' && 'Cambio Mansione'}
                            {visit.visit_type === 'richiesta_lavoratore' && 'Su Richiesta'}
                            {visit.visit_type === 'fine_rapporto' && 'Fine Rapporto'}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        Dettagli
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nessun appuntamento programmato per oggi
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Visite in Scadenza */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Visite in Scadenza (Prossimi 30 giorni)</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardStats?.expiringVisits && dashboardStats.expiringVisits.length > 0 ? (
              <div className="space-y-3">
                {dashboardStats.expiringVisits.map((visit: any) => (
                  <div key={visit.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <div>
                        <p className="font-medium text-sm">{visit.employees?.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Scadenza: {format(new Date(visit.scheduled_date), "d MMMM yyyy", { locale: it })}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Programma
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nessuna visita in scadenza nei prossimi 30 giorni
              </p>
            )}
          </CardContent>
        </Card>

        {/* Giudizi di Idoneità in Scadenza */}
        <Card>
          <CardHeader>
            <CardTitle>Giudizi di Idoneità in Scadenza (Prossimi 60 giorni)</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardStats?.expiringJudgments && dashboardStats.expiringJudgments.length > 0 ? (
              <div className="space-y-3">
                {dashboardStats.expiringJudgments.map((judgment: any) => (
                  <div key={judgment.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-4 w-4 text-warning" />
                      <div>
                        <p className="font-medium text-sm">{judgment.employees?.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Scadenza: {judgment.expiry_date ? format(new Date(judgment.expiry_date), "d MMMM yyyy", { locale: it }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setPrefilledEmployeeId(judgment.employee_id);
                        setJudgmentDialogOpen(true);
                      }}
                    >
                      Rinnova
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nessun giudizio di idoneità in scadenza nei prossimi 60 giorni
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Dialogs */}
      {companyId && (
        <>
          <MedicalVisitDialog
            open={visitDialogOpen}
            onOpenChange={setVisitDialogOpen}
            companyId={companyId}
          />
          <MedicalRecordDialog
            open={recordDialogOpen}
            onOpenChange={setRecordDialogOpen}
            companyId={companyId}
          />
          <ProtocolManagementDialog
            open={protocolDialogOpen}
            onOpenChange={setProtocolDialogOpen}
            companyId={companyId}
          />
          <FitnessJudgmentDialog
            open={judgmentDialogOpen}
            onOpenChange={(open) => {
              setJudgmentDialogOpen(open);
              if (!open) setPrefilledEmployeeId(undefined);
            }}
            companyId={companyId}
            prefilledEmployeeId={prefilledEmployeeId}
          />
          <JobRoleProtocolDialog
            open={jobRoleProtocolDialogOpen}
            onOpenChange={setJobRoleProtocolDialogOpen}
            companyId={companyId}
          />
          <NotificationSettingsDialog
            open={notificationSettingsOpen}
            onOpenChange={setNotificationSettingsOpen}
            companyId={companyId}
          />
          <NotificationLogsDialog
            open={notificationLogsOpen}
            onOpenChange={setNotificationLogsOpen}
            companyId={companyId}
          />
          <MedicalRecordListDialog
            open={recordListOpen}
            onOpenChange={setRecordListOpen}
            companyId={companyId}
          />
          <MedicalVisitListDialog
            open={visitListOpen}
            onOpenChange={setVisitListOpen}
            companyId={companyId}
          />
          <DVRRiskManagement
            open={dvrRisksOpen}
            onOpenChange={setDvrRisksOpen}
            companyId={companyId}
          />
          <MedicalTimelineDialog
            open={timelineDialogOpen}
            onOpenChange={setTimelineDialogOpen}
            companyId={companyId}
          />
        </>
      )}
    </div>
  );
};

export default HealthSurveillance;