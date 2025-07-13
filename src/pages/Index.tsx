import React, { useState, useEffect } from 'react';
import { GameCard, GameData } from '@/components/GameCard';
import { GameModal } from '@/components/GameModal';
import { NavigationTabs, TabData } from '@/components/NavigationTabs';
import { gamesData } from '@/data/gamesData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Calculator, 
  Target, 
  Clock, 
  Star,
  Play,
  TrendingUp,
  Users,
  Sparkles
} from "lucide-react";

// 중학수학 탭 데이터
const middleSchoolTabs: TabData[] = [
  { id: 'middle1', label: '중학교 1학년', description: '정수, 유리수, 문자와 식, 일차방정식' },
  { id: 'middle2', label: '중학교 2학년', description: '연립방정식, 일차함수, 확률과 통계' },
  { id: 'middle3', label: '중학교 3학년', description: '이차방정식, 이차함수, 원의 성질' }
];

// 고등수학 탭 데이터
const highSchoolTabs: TabData[] = [
  { id: 'common-math', label: '공통수학', description: '고등학교 공통수학 과정' },
  { id: 'algebra', label: '대수', description: '다항식, 방정식과 부등식' },
  { id: 'calculus1', label: '미적분 I', description: '극한, 미분' },
  { id: 'calculus2', label: '미적분 II', description: '적분' },
  { id: 'probability', label: '확률과 통계', description: '확률과 통계 개념' },
  { id: 'geometry', label: '기하', description: '평면기하, 공간기하' },
  { id: 'ai-math', label: '인공지능 수학', description: 'AI와 수학을 결합한 미래형 게임' }
];

const breakGameTabs: TabData[] = [
  { id: 'break-game', label: '몸 풀기 게임', description: '간단한 몸풀기 수학 게임' }
];

const classManagementTabs: TabData[] = [
  { id: 'class-management', label: '학급운영', description: '학급운영 도구 및 활동' }
];

const mainTabs = [
  { id: 'middle', label: '중학수학' },
  { id: 'high', label: '고등수학' },
  { id: 'break-game', label: '몸 풀기 게임' },
  { id: 'class-management', label: '학급운영' },
];

const Index = () => {
  const [activeSection, setActiveSection] = useState('middle');
  const [activeTab, setActiveTab] = useState('middle1');
  const [selectedGame, setSelectedGame] = useState<GameData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // URL 쿼리 파라미터를 읽어서 초기 상태 설정
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    const tab = urlParams.get('tab');
    
    if (section) {
      setActiveSection(section);
    }
    if (tab) {
      setActiveTab(tab);
    } else if (section) {
      // section만 있고 tab이 없으면 기본 탭 설정
      if (section === 'middle') {
        setActiveTab('middle1');
      } else if (section === 'high') {
        setActiveTab('common-math');
      } else if (section === 'break-game') {
        setActiveTab('break-game');
      } else if (section === 'class-management') {
        setActiveTab('class-management');
      }
    }
  }, []);

  // URL 변경 감지
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const section = urlParams.get('section');
      const tab = urlParams.get('tab');
      
      if (section) {
        setActiveSection(section);
      }
      if (tab) {
        setActiveTab(tab);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleGameClick = (game: GameData) => {
    setSelectedGame(game);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedGame(null);
  };

  const handleSectionChange = (sectionId: string, tabId?: string) => {
    setActiveSection(sectionId);
    if (tabId) {
      setActiveTab(tabId);
      return;
    }
    if (sectionId === 'middle') {
      setActiveTab('middle1');
    } else if (sectionId === 'high') {
      setActiveTab('common-math');
    } else if (sectionId === 'break-game') {
      setActiveTab('break-game');
    } else if (sectionId === 'class-management') {
      setActiveTab('class-management');
    }
  };

  let currentTabs: TabData[] = [];
  if (activeSection === 'middle') currentTabs = middleSchoolTabs;
  else if (activeSection === 'high') currentTabs = highSchoolTabs;
  else if (activeSection === 'break-game') currentTabs = breakGameTabs;
  else if (activeSection === 'class-management') currentTabs = classManagementTabs;

  const currentGames = gamesData[activeTab] || [];
  const currentTabData = currentTabs.find(tab => tab.id === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'playable': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'development': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '초급': return 'bg-blue-100 text-blue-700 border-blue-200';
      case '중급': return 'bg-purple-100 text-purple-700 border-purple-200';
      case '고급': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <div className="text-6xl">🎮</div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              수학 게임 아카이브
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              현직 교사들이 만든 <span className="font-semibold text-blue-600">디지털 수학 콘텐츠</span>를 
              게임으로 즐겨보세요
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center space-x-2 bg-blue-50 rounded-full px-6 py-3 border border-blue-200">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <span className="text-blue-700 font-medium">체계적 학습</span>
              </div>
              <div className="flex items-center space-x-2 bg-purple-50 rounded-full px-6 py-3 border border-purple-200">
                <Target className="h-5 w-5 text-purple-600" />
                <span className="text-purple-700 font-medium">단계별 난이도</span>
              </div>
              <div className="flex items-center space-x-2 bg-green-50 rounded-full px-6 py-3 border border-green-200">
                <Calculator className="h-5 w-5 text-green-600" />
                <span className="text-green-700 font-medium">실습 중심</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Navigation */}
      <section className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex space-x-1 py-4">
            {mainTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleSectionChange(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                  activeSection === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Sub Navigation Tabs */}
      <NavigationTabs 
        tabs={currentTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Section Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {currentTabData?.label}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl">
                {currentTabData?.description}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 border border-gray-200">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  총 {currentGames.length}개 게임
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        {currentGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentGames.map((game) => (
              <Card 
                key={game.id} 
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg bg-white rounded-2xl overflow-hidden"
                onClick={() => handleGameClick(game)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{game.icon}</div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={`text-xs border ${getStatusColor(game.status)}`}>
                        {game.status === 'playable' ? '플레이 가능' : '개발 중'}
                      </Badge>
                      {game.difficulty && (
                        <Badge className={`text-xs border ${getDifficultyColor(game.difficulty)}`}>
                          {game.difficulty}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                    {game.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <CardDescription className="text-gray-600 mb-6 leading-relaxed">
                    {game.summary
                      ? game.summary
                      : (() => {
                          const firstLine = game.description.split('\n')[0];
                          return firstLine.length > 50 ? firstLine.slice(0, 50) + '...' : firstLine;
                        })()
                    }
                  </CardDescription>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {game.estimatedTime && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{game.estimatedTime}</span>
                        </div>
                      )}
                      {game.category && (
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{game.category}</span>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-all duration-200 bg-blue-600 hover:bg-blue-700 rounded-full px-4"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      시작
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🚧</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              게임 준비 중
            </h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              이 섹션의 게임들은 현재 개발 중입니다. 곧 만나볼 수 있어요!
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => handleSectionChange('middle')}
                className="rounded-full px-6 py-3"
              >
                중학수학 보기
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleSectionChange('high')}
                className="rounded-full px-6 py-3"
              >
                고등수학 보기
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 mt-20">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center items-center space-x-3 mb-6">
            <div className="text-3xl">🎮</div>
            <h3 className="text-2xl font-bold">Math Game Archive</h3>
          </div>
          <p className="text-gray-300 mb-6 text-lg">
            행복한 수학, 함께 만들어요 😊
          </p>
          <p className="text-sm text-gray-400">
            © 행복한윤쌤 |{' '}
            <a 
              href="https://blog.naver.com/happy_yoonssam" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              https://blog.naver.com/happy_yoonssam
            </a>
          </p>
        </div>
      </footer>

      {/* Game Modal */}
      <GameModal
        game={selectedGame}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default Index;
