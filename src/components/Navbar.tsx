import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { FileText, LogOut, Settings, Shield, ChevronDown, Calculator } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, hasRole, isSuperAdmin } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  // Check if user is ONLY a medical_officer (no other admin/hr roles)
  const isMedicalOfficerOnly = hasRole('medical_officer') && !hasRole('admin') && !hasRole('superadmin') && !hasRole('admin_sub_azienda') && !hasRole('hr_manager');

  const employeeMenuItems = [
    {
      path: "/employees",
      label: "Elenco Dipendenti",
      roles: ["superadmin", "admin", "admin_sub_azienda", "hr_manager", "employee"],
    },
    {
      path: "/presence",
      label: "Presenze",
      roles: ["superadmin", "admin", "admin_sub_azienda", "hr_manager", "employee"],
    },
    {
      path: "/payroll",
      label: "Cedolini",
      roles: ["superadmin", "admin", "admin_sub_azienda", "hr_manager", "employee"],
    },
    {
      path: "/contract",
      label: "Contratti",
      roles: ["superadmin", "admin", "admin_sub_azienda", "hr_manager", "employee"],
    },
  ];

  const complianceMenuItems = [
    {
      path: "/compliance",
      label: "Adempimenti Fiscali",
      roles: ["superadmin", "admin", "admin_sub_azienda"],
    },
    {
      path: "/health-surveillance",
      label: "Sorveglianza Sanitaria",
      roles: ["superadmin", "admin", "admin_sub_azienda", "hr_manager", "employee"],
    },
  ];

  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      roles: ["superadmin", "admin", "admin_sub_azienda", "hr_manager", "employee", "medical_officer"],
    },
    { path: "/documents", label: "Documenti", roles: ["superadmin", "admin", "admin_sub_azienda", "hr_manager"] },
    { path: "/reports", label: "Report", roles: ["superadmin", "admin", "admin_sub_azienda", "hr_manager"] },
  ];

  const settingsItem = {
    path: "/settings",
    label: "Impostazioni",
    roles: ["superadmin", "admin", "admin_sub_azienda"],
  };

  const dashboardItem = navItems[0]; // Dashboard
  const otherNavItems = navItems.slice(1); // Documents, Reports

  const visibleDashboard = dashboardItem.roles.some((role) => hasRole(role)) ? dashboardItem : null;
  const visibleOtherNavItems = otherNavItems.filter((item) => item.roles.some((role) => hasRole(role)));
  const visibleSettings = settingsItem.roles.some((role) => hasRole(role)) ? settingsItem : null;
  const visibleEmployeeMenuItems = employeeMenuItems.filter((item) => item.roles.some((role) => hasRole(role)));
  const visibleComplianceMenuItems = complianceMenuItems.filter((item) => item.roles.some((role) => hasRole(role)));

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground"><h1 className="text-xl font-bold text-foreground">PayHub by Notelseit</h1></h1>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {/* Dashboard */}
              {visibleDashboard && (
                <Button
                  variant={location.pathname === visibleDashboard.path ? "secondary" : "ghost"}
                  onClick={() => navigate(visibleDashboard.path)}
                  className="text-sm"
                >
                  {visibleDashboard.label}
                </Button>
              )}

              {/* Medical Officer: menu dedicato */}
              {isMedicalOfficerOnly ? (
                <>
                  <Button
                    variant={location.pathname === "/health-surveillance" ? "secondary" : "ghost"}
                    onClick={() => navigate("/health-surveillance")}
                    className="text-sm"
                  >
                    Sorveglianza Sanitaria
                  </Button>
                  <Button
                    variant={location.pathname === "/employees" ? "secondary" : "ghost"}
                    onClick={() => navigate("/employees")}
                    className="text-sm"
                  >
                    Elenco Dipendenti
                  </Button>
                </>
              ) : (
              <>
              {/* Dropdown Menu Dipendenti */}
              {visibleEmployeeMenuItems.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={
                        ["/employees", "/presence", "/payroll", "/contract"].includes(location.pathname)
                          ? "secondary"
                          : "ghost"
                      }
                      className="text-sm gap-1"
                    >
                      Dipendenti
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {visibleEmployeeMenuItems.map((item) => (
                      <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)}>
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Dropdown Menu Compliance */}
              {visibleComplianceMenuItems.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={
                        ["/compliance", "/health-surveillance"].includes(location.pathname)
                          ? "secondary"
                          : "ghost"
                      }
                      className="text-sm gap-1"
                    >
                      Compliance
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {visibleComplianceMenuItems.map((item) => (
                      <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)}>
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Altri menu items: Documents, Reports */}
              {visibleOtherNavItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "secondary" : "ghost"}
                  onClick={() => navigate(item.path)}
                  className="text-sm"
                >
                  {item.label}
                </Button>
              ))}

              {/* Simulatore Costo */}
              {(hasRole("superadmin") || hasRole("admin") || hasRole("admin_sub_azienda") || hasRole("hr_manager")) && (
                <Button
                  variant={location.pathname === "/simulator" ? "secondary" : "ghost"}
                  onClick={() => navigate("/simulator")}
                  className="text-sm gap-1"
                >
                  <Calculator className="h-4 w-4" />
                  Simulatore
                </Button>
              )}

              {/* Gestione Aziende - per superadmin e admin (non admin_sub_azienda) */}
              {(isSuperAdmin || (hasRole("admin") && !hasRole("admin_sub_azienda"))) && (
                <Button
                  variant={location.pathname === "/companies" ? "secondary" : "ghost"}
                  onClick={() => navigate("/companies")}
                  className="text-sm"
                >
                  Gestione Aziende
                </Button>
              )}

              {/* Impostazioni */}
              {visibleSettings && (
                <Button
                  variant={location.pathname === visibleSettings.path ? "secondary" : "ghost"}
                  onClick={() => navigate(visibleSettings.path)}
                  className="text-sm"
                >
                  {visibleSettings.label}
                </Button>
              )}
              </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isSuperAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/superadmin")}>
                    <Shield className="mr-2 h-4 w-4" />
                    Pannello SuperAdmin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Esci
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
