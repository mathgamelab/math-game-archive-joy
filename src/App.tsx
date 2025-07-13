import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainNavigation, MainNavItem } from "@/components/MainNavigation";
import Index from "./pages/Index";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import { useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [activeSection, setActiveSection] = useState('about');

  const navigationItems: MainNavItem[] = [
    {
      id: 'about',
      label: '소개',
    },
    {
      id: 'middle',
      label: '중학수학',
      children: [
        { id: 'middle1', label: '중학교 1학년', description: '정수, 유리수, 문자와 식, 일차방정식' },
        { id: 'middle2', label: '중학교 2학년', description: '연립방정식, 일차함수, 확률과 통계' },
        { id: 'middle3', label: '중학교 3학년', description: '이차방정식, 이차함수, 원의 성질' }
      ]
    },
    {
      id: 'high',
      label: '고등수학',
      children: [
        { id: 'common-math', label: '공통수학', description: '고등학교 공통수학 과정' },
        { id: 'algebra', label: '대수', description: '다항식, 방정식과 부등식' },
        { id: 'calculus1', label: '미적분 I', description: '극한, 미분' },
        { id: 'calculus2', label: '미적분 II', description: '적분' },
        { id: 'probability', label: '확률과 통계', description: '확률과 통계 개념' },
        { id: 'geometry', label: '기하', description: '평면기하, 공간기하' },
        { id: 'ai-math', label: '인공지능 수학', description: 'AI와 수학을 결합한 미래형 게임' }
      ]
    }
  ];

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
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
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
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
