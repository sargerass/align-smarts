import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/authStore";
import { LoginForm } from "@/components/LoginForm";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import CreateGoal from "./pages/CreateGoal";
import GoalManagement from "./pages/GoalManagement";
import Organization from "./pages/Organization";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <LoginForm />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <SidebarInset className="flex flex-col">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                  <SidebarTrigger className="-ml-1" />
                </header>
                <main className="flex-1 p-4 overflow-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/goals" element={<Goals />} />
                    <Route path="/goals/new" element={<CreateGoal />} />
                    <Route path="/goals/:goalId/manage" element={<GoalManagement />} />
                    <Route path="/organization" element={<Organization />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
