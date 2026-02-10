import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useAccessLogger } from "@/hooks/useAccessLogger";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
      <Route path="/dashboard" element={
        <ProtectedRoute requireRole={['superadmin', 'admin', 'admin_sub_azienda', 'hr_manager', 'employee']}>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/employees" element={
        <ProtectedRoute requireRole={['superadmin', 'admin', 'admin_sub_azienda', 'hr_manager', 'employee']}>
          <Employees />
        </ProtectedRoute>
      } />
      <Route path="/presence" element={
        <ProtectedRoute requireRole={['superadmin', 'admin', 'admin_sub_azienda', 'hr_manager', 'employee']}>
          <Presence />
        </ProtectedRoute>
      } />
      <Route path="/payroll" element={
        <ProtectedRoute requireRole={['superadmin', 'admin', 'admin_sub_azienda', 'hr_manager', 'employee']}>
          <Payroll />
        </ProtectedRoute>
      } />
      <Route path="/contract" element={
        <ProtectedRoute requireRole={['superadmin', 'admin', 'admin_sub_azienda', 'hr_manager', 'employee']}>
          <Contract />
        </ProtectedRoute>
      } />
      <Route path="/compliance" element={
        <ProtectedRoute requireRole={['superadmin', 'admin', 'admin_sub_azienda']}>
          <Compliance />
        </ProtectedRoute>
      } />
      <Route path="/compliance/f24" element={
        <ProtectedRoute requireRole={['superadmin', 'admin', 'admin_sub_azienda']}>
          <F24 />
        </ProtectedRoute>
      } />
      <Route path="/health-surveillance" element={
        <ProtectedRoute requireRole={['superadmin', 'admin', 'admin_sub_azienda', 'hr_manager', 'employee']}>
          <HealthSurveillance />
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute requireRole={['superadmin', 'admin', 'admin_sub_azienda', 'hr_manager']}>
          <Reports />
        </ProtectedRoute>
      } />
      <Route path="/documents" element={
        <ProtectedRoute requireRole={['superadmin', 'admin', 'admin_sub_azienda', 'hr_manager']}>
          <Documents />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute requireRole={['superadmin', 'admin', 'admin_sub_azienda']}>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/superadmin" element={
        <ProtectedRoute requireRole={['superadmin']}>
          <SuperAdmin />
        </ProtectedRoute>
      } />
      <Route path="/companies" element={
        <ProtectedRoute requireRole={['superadmin', 'admin']}>
          <Companies />
        </ProtectedRoute>
      } />
      <Route path="/simulator" element={
        <ProtectedRoute requireRole={['superadmin', 'admin', 'admin_sub_azienda', 'hr_manager']}>
          <Simulator />
        </ProtectedRoute>
      } />
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
