import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useScrollbarSettings } from "@/hooks/useScrollbarSettings";
import { AppLayout } from "@/components/layout/AppLayout";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { VehicleList } from "@/components/vehicles/VehicleList";
import { FuelEntry } from "@/components/fuel/FuelEntry";
import { TicketList } from "@/components/tickets/TicketList";
import { WorkOrderList } from "@/components/workorders/WorkOrderList";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { PlanningCalendar } from "@/components/planning/PlanningCalendar";
import { AdminDocuments } from "@/components/admin/AdminDocuments";
import { GestionnaireList } from "@/components/gestionnaires/GestionnaireList";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { StatisticsPanel } from "@/components/statistics/StatisticsPanel";
import { AlertsPanel } from "@/components/alerts/AlertsPanel";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ScrollbarInit() {
  useScrollbarSettings();
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <ScrollbarInit />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="vehicles" element={<VehicleList />} />
                <Route path="fuel" element={<FuelEntry />} />
                <Route path="tickets" element={<TicketList />} />
                <Route path="workorders" element={<WorkOrderList />} />
                <Route path="expenses" element={<ExpenseList />} />
                <Route path="planning" element={<PlanningCalendar />} />
                <Route path="gestionnaires" element={<GestionnaireList />} />
                <Route path="admin" element={<AdminDocuments />} />
                <Route path="statistics" element={<StatisticsPanel />} />
                <Route path="alerts" element={<AlertsPanel />} />
                <Route path="settings" element={<SettingsPanel />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
