import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { MainNavigation, MainNavItem } from "@/components/MainNavigation";
import Main from "./pages/Main";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useState, useEffect } from "react";
import ContactModal from '@/components/ContactModal';
import ContactFormModal from '@/components/ContactFormModal';

const queryClient = new QueryClient();

function AppRoutes({ navigationItems, onContactClick }: { navigationItems: MainNavItem[], onContactClick: () => void }) {
  const [activeSection, setActiveSection] = useState('main');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '/main') {
      setActiveSection('main');
    } else if (location.pathname.startsWith('/games')) {
      setActiveSection('games');
    }
  }, [location.pathname]);

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'main') {
      navigate('/main');
    } else if (sectionId === 'games') {
      navigate('/games');
    }
  };

  return (
    <div className="min-h-screen">
      <MainNavigation
        items={navigationItems}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onContactClick={onContactClick}
      />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/main" element={<Main />} />
        <Route path="/games" element={<Index />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

const App = () => {
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

  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ContactModal
            isOpen={isContactOpen}
            onClose={() => setIsContactOpen(false)}
            onEmailClick={() => {
              setIsContactOpen(false);
              setIsContactFormOpen(true);
            }}
          />
          <ContactFormModal
            isOpen={isContactFormOpen}
            onClose={() => setIsContactFormOpen(false)}
          />
          <AppRoutes navigationItems={navigationItems} onContactClick={() => setIsContactOpen(true)} />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
