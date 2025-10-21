import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { FileText, LogOut, Settings, Shield, ChevronDown } from "lucide-react";
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

  const navItems = [
    { path: "/dashboard", label: "Dashboard", roles: ["admin", "hr_manager", "employee"] },
    { path: "/compliance", label: "Adempimenti Fiscali", roles: ["admin", "hr_manager"] },
    { path: "/documents", label: "Documenti", roles: ["admin", "hr_manager"] },
    { path: "/reports", label: "Report", roles: ["admin", "hr_manager"] },
    { path: "/settings", label: "Impostazioni", roles: ["admin", "hr_manager"] },
  ];

  const employeeMenuItems = [
    { path: "/employees", label: "Elenco Dipendenti", roles: ["admin", "hr_manager", "employee"] },
    { path: "/presence", label: "Presenze", roles: ["admin", "hr_manager", "employee"] },
    { path: "/payroll", label: "Cedolini", roles: ["admin", "hr_manager", "employee"] },
  ];

  const navItems = [
    { path: "/compliance", label: "Adempimenti Fiscali", roles: ["admin", "hr_manager"] },
    { path: "/documents", label: "Documenti", roles: ["admin", "hr_manager"] },
    { path: "/reports", label: "Report", roles: ["admin", "hr_manager"] },
    { path: "/settings", label: "Impostazioni", roles: ["admin", "hr_manager"] },
  ];

  const visibleNavItems = navItems.filter((item) => item.roles.some((role) => hasRole(role)));

  const visibleEmployeeMenuItems = employeeMenuItems.filter((item) => item.roles.some((role) => hasRole(role)));

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">PayHub</h1>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {visibleNavItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "secondary" : "ghost"}
                  onClick={() => navigate(item.path)}
                  className="text-sm"
                >
                  {item.label}
                </Button>
              ))}

              {/* Dropdown Menu Dipendenti */}
              {visibleEmployeeMenuItems.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={
                        ["/employees", "/presence", "/payroll"].includes(location.pathname) ? "secondary" : "ghost"
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

              {/* Gestione Aziende - per admin */}
              {hasRole("admin") && (
                <Button
                  variant={location.pathname === "/superadmin" ? "secondary" : "ghost"}
                  onClick={() => navigate("/superadmin")}
                  className="text-sm"
                >
                  Gestione Aziende
                </Button>
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
