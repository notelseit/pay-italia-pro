import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  BarChart3,
  Calculator,
  Building2,
  Settings,
  ShieldCheck,
  LogOut,
  ClipboardList,
  Calendar,
  Receipt,
  FileSignature,
  Stethoscope,
  ChevronDown,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, hasRole, isSuperAdmin } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;

  const isMedicalOfficerOnly =
    hasRole("medical_officer") &&
    !hasRole("admin") &&
    !hasRole("superadmin") &&
    !hasRole("admin_sub_azienda") &&
    !hasRole("hr_manager");

  const canAccess = (roles: string[]) => roles.some((r) => hasRole(r));

  // Navigation structure
  const employeeSubItems = [
    { path: "/employees", label: "Elenco", icon: Users, roles: ["superadmin", "admin", "admin_sub_azienda", "hr_manager", "employee"] },
    { path: "/presence", label: "Presenze", icon: Calendar, roles: ["superadmin", "admin", "admin_sub_azienda", "hr_manager", "employee"] },
    { path: "/payroll", label: "Cedolini", icon: Receipt, roles: ["superadmin", "admin", "admin_sub_azienda", "hr_manager", "employee"] },
    { path: "/contract", label: "Contratti", icon: FileSignature, roles: ["superadmin", "admin", "admin_sub_azienda", "hr_manager", "employee"] },
  ];

  const complianceSubItems = [
    { path: "/compliance", label: "Adempimenti Fiscali", icon: ClipboardList, roles: ["superadmin", "admin", "admin_sub_azienda"] },
    { path: "/health-surveillance", label: "Sorveglianza Sanitaria", icon: Stethoscope, roles: ["superadmin", "admin", "admin_sub_azienda", "hr_manager", "employee", "medical_officer"] },
  ];

  const employeeItemsVisible = !isMedicalOfficerOnly && employeeSubItems.filter((i) => canAccess(i.roles));
  const complianceItemsVisible = complianceSubItems.filter((i) => canAccess(i.roles));

  const isEmployeeActive = employeeSubItems.some((i) => isActive(i.path));
  const isComplianceActive = complianceSubItems.some((i) => isActive(i.path));

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigazione</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate("/dashboard")}
                  isActive={isActive("/dashboard")}
                  tooltip="Dashboard"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Dipendenti (collapsible) */}
              {employeeItemsVisible && employeeItemsVisible.length > 0 && (
                <Collapsible defaultOpen={isEmployeeActive} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip="Dipendenti" isActive={isEmployeeActive}>
                        <Users className="h-4 w-4" />
                        <span>Dipendenti</span>
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {employeeItemsVisible.map((item) => (
                          <SidebarMenuSubItem key={item.path}>
                            <SidebarMenuSubButton
                              onClick={() => navigate(item.path)}
                              isActive={isActive(item.path)}
                            >
                              <item.icon className="h-3.5 w-3.5" />
                              <span>{item.label}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}

              {/* Compliance (collapsible) */}
              {complianceItemsVisible.length > 0 && (
                <Collapsible defaultOpen={isComplianceActive} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip="Compliance" isActive={isComplianceActive}>
                        <Shield className="h-4 w-4" />
                        <span>Compliance</span>
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {complianceItemsVisible.map((item) => (
                          <SidebarMenuSubItem key={item.path}>
                            <SidebarMenuSubButton
                              onClick={() => navigate(item.path)}
                              isActive={isActive(item.path)}
                            >
                              <item.icon className="h-3.5 w-3.5" />
                              <span>{item.label}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}

              {/* Documenti */}
              {canAccess(["superadmin", "admin", "admin_sub_azienda", "hr_manager"]) && !isMedicalOfficerOnly && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate("/documents")}
                    isActive={isActive("/documents")}
                    tooltip="Documenti"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Documenti</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Report */}
              {canAccess(["superadmin", "admin", "admin_sub_azienda", "hr_manager"]) && !isMedicalOfficerOnly && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate("/reports")}
                    isActive={isActive("/reports")}
                    tooltip="Report"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Report</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Simulatore */}
              {canAccess(["superadmin", "admin", "admin_sub_azienda", "hr_manager"]) && !isMedicalOfficerOnly && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate("/simulator")}
                    isActive={isActive("/simulator")}
                    tooltip="Simulatore"
                  >
                    <Calculator className="h-4 w-4" />
                    <span>Simulatore</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Aziende */}
              {canAccess(["superadmin", "admin"]) && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate("/companies")}
                    isActive={isActive("/companies")}
                    tooltip="Aziende"
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Aziende</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Impostazioni */}
              {canAccess(["superadmin", "admin", "admin_sub_azienda"]) && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate("/settings")}
                    isActive={isActive("/settings")}
                    tooltip="Impostazioni"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Impostazioni</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* SuperAdmin */}
              {isSuperAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate("/superadmin")}
                    isActive={isActive("/superadmin")}
                    tooltip="SuperAdmin"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>SuperAdmin</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut()} tooltip="Logout">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
