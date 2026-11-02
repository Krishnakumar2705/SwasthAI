import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "./contexts/LanguageContext";
import { lazy, Suspense } from "react";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy-loaded routes for code splitting
const Hospitals = lazy(() => import("./pages/Hospitals"));
const BloodBanks = lazy(() => import("./pages/BloodBanks"));
const Pharmacy = lazy(() => import("./pages/Pharmacy"));
const Emergency = lazy(() => import("./pages/Emergency"));
const AiTriage = lazy(() => import("./pages/AiTriage"));
const About = lazy(() => import("./pages/About"));
const HealthRisk = lazy(() => import("./pages/HealthRisk"));
const InjuryDetection = lazy(() => import("./pages/InjuryDetection"));
const MapPage = lazy(() => import("./pages/MapPage"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/hospitals" element={<Hospitals />} />
                <Route path="/blood-banks" element={<BloodBanks />} />
                <Route path="/pharmacy" element={<Pharmacy />} />
                <Route path="/emergency" element={<Emergency />} />
                <Route path="/triage" element={<AiTriage />} />
                <Route path="/about" element={<About />} />
                <Route path="/health-risk" element={<HealthRisk />} />
                <Route path="/injury-detection" element={<InjuryDetection />} />
                <Route path="/map" element={<MapPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  </ThemeProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
