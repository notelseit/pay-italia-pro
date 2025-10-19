import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Presence from "./pages/Presence";
import Payroll from "./pages/Payroll";
import Compliance from "./pages/Compliance";
import F24 from "./pages/F24";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Documents from "./pages/Documents";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={
              <ProtectedRoute requireRole={['admin', 'hr_manager', 'employee']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/employees" element={
              <ProtectedRoute requireRole={['admin', 'hr_manager', 'employee']}>
                <Employees />
              </ProtectedRoute>
            } />
            <Route path="/presence" element={
              <ProtectedRoute requireRole={['admin', 'hr_manager', 'employee']}>
                <Presence />
              </ProtectedRoute>
            } />
            <Route path="/payroll" element={
              <ProtectedRoute requireRole={['admin', 'hr_manager', 'employee']}>
                <Payroll />
              </ProtectedRoute>
            } />
            <Route path="/compliance" element={
              <ProtectedRoute requireRole={['admin', 'hr_manager']}>
                <Compliance />
              </ProtectedRoute>
            } />
            <Route path="/compliance/f24" element={
              <ProtectedRoute requireRole={['admin', 'hr_manager']}>
                <F24 />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute requireRole={['admin', 'hr_manager']}>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/documents" element={
              <ProtectedRoute requireRole={['admin', 'hr_manager']}>
                <Documents />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute requireRole={['admin', 'hr_manager', 'employee']}>
                <Settings />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
