import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StandaloneAreaAnalysisTool from "./components/StandaloneAreaAnalysisTool";
import { parseUrlConfig } from "./utils/urlConfig";

const queryClient = new QueryClient();

const App = () => {
  // Check if we're running in iframe mode (has URL parameters)
  const urlConfig = parseUrlConfig();
  const isIframeMode = Object.keys(urlConfig).length > 0 || window.location.search.includes('iframe=true');

  if (isIframeMode) {
    // Iframe mode - show only the analysis tool
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <StandaloneAreaAnalysisTool {...urlConfig} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Normal mode - show full app with routing
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;