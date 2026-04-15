import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useAccessLogger } from "@/hooks/useAccessLogger";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import { Chatbot } from "@/components/Chatbot";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Presence from "./pages/Presence";
import Payroll from "./pages/Payroll";
import Contract from "./pages/Contract";
import Compliance from "./pages/Compliance";
import F24 from "./pages/F24";
import HealthSurveillance from "./pages/HealthSurveillance";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Documents from "./pages/Documents";
import SuperAdmin from "./pages/SuperAdmin";
import Companies from "./pages/Companies";
import Simulator from "./pages/Simulator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  useAccessLogger();
  
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Protected routes with sidebar layout */}
      <Route element={
        <ProtectedRoute requireRole={['superadmin', 'admin', 'admin_sub_azienda', 'hr_manager', 'employee', 'medical_officer']}>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/presence" element={<Presence />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/contract" element={<Contract />} />
        <Route path="/compliance" element={<Compliance />} />
        <Route path="/compliance/f24" element={<F24 />} />
        <Route path="/health-surveillance" element={<HealthSurveillance />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/superadmin" element={<SuperAdmin />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/simulator" element={<Simulator />} />
      </Route>

      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
          <Chatbot />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
