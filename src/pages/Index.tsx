import React, { useState } from 'react';
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
  TrendingUp
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

  const handleGameClick = (game: GameData) => {
    setSelectedGame(game);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedGame(null);
  };

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
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
      case 'playable': return 'bg-green-100 text-green-800';
      case 'development': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '초급': return 'bg-blue-100 text-blue-800';
      case '중급': return 'bg-purple-100 text-purple-800';
      case '고급': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="text-5xl">🎮📐</div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              수학 게임 아카이브
            </h1>
            <p className="text-lg md:text-xl mb-8 text-blue-100">
              현직 교사들이 만든 <span className="font-semibold">디지털 수학 콘텐츠</span>를 
              게임으로 즐겨보세요
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm">체계적 학습</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                <Target className="h-4 w-4" />
                <span className="text-sm">단계별 난이도</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                <Calculator className="h-4 w-4" />
                <span className="text-sm">실습 중심</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Navigation */}
      <section className="sticky top-16 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 py-4">
            {mainTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleSectionChange(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeSection === tab.id
                    ? 'bg-blue-100 text-blue-700 font-semibold'
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
      <main className="container mx-auto px-4 py-8">
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {currentTabData?.label}
              </h2>
              <p className="text-gray-600">
                {currentTabData?.description}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-500">
                총 {currentGames.length}개 게임
              </div>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        {currentGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentGames.map((game) => (
              <Card 
                key={game.id} 
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md"
                onClick={() => handleGameClick(game)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="text-3xl mb-2">{game.icon}</div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge className={`text-xs ${getStatusColor(game.status)}`}>
                        {game.status === 'playable' ? '플레이 가능' : '개발 중'}
                      </Badge>
                      {game.difficulty && (
                        <Badge className={`text-xs ${getDifficultyColor(game.difficulty)}`}>
                          {game.difficulty}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {game.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm mb-4 line-clamp-2">
                    {game.description}
                  </CardDescription>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {game.estimatedTime && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{game.estimatedTime}</span>
                        </div>
                      )}
                      {game.category && (
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-3 w-3" />
                          <span>{game.category}</span>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      시작
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              게임 준비 중
            </h3>
            <p className="text-gray-600 mb-6">
              이 섹션의 게임들은 현재 개발 중입니다. 곧 만나볼 수 있어요!
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => handleSectionChange('middle')}>
                중학수학 보기
              </Button>
              <Button variant="outline" onClick={() => handleSectionChange('high')}>
                고등수학 보기
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <div className="text-2xl">🎮</div>
            <h3 className="text-xl font-bold">Math Game Archive</h3>
          </div>
          <p className="text-gray-300 mb-4">
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
