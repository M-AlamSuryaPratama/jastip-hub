import { useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { setupOnlineSync, syncQueue } from "@/lib/offlineQueue";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function OnlineSyncProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();

  useEffect(() => {
    // Sync any queued actions on mount
    syncQueue().then(() => qc.invalidateQueries({ queryKey: ['packages'] }));
    // Auto-sync when coming back online
    return setupOnlineSync(() => qc.invalidateQueries({ queryKey: ['packages'] }));
  }, [qc]);

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <OnlineSyncProvider>
        <OfflineIndicator />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </OnlineSyncProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
