import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { MainNavigation, MainNavItem } from "@/components/MainNavigation";
import Index from "./pages/Index";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [activeSection, setActiveSection] = useState('main');

  const navigationItems: MainNavItem[] = [
    {
      id: 'main',
      label: '메인',
    },
    {
      id: 'games',
      label: '게임하기',
    }
  ];

  // 라우팅에 따라 activeSection 자동 변경
  const location = typeof window !== 'undefined' ? window.location : null;
  useEffect(() => {
    if (!location) return;
    if (location.pathname === '/' || location.pathname === '/about') {
      setActiveSection('main');
    } else if (location.pathname.startsWith('/games')) {
      setActiveSection('games');
    }
  }, [location?.pathname]);

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'main') {
      window.history.pushState({}, '', '/about');
    } else if (sectionId === 'games') {
      window.history.pushState({}, '', '/games');
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen">
            <MainNavigation
              items={navigationItems}
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
            />
            <Routes>
              <Route path="/" element={<About />} />
              <Route path="/about" element={<About />} />
              <Route path="/games" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
