import React, { useState } from 'react';
import { GameCard, GameData } from '@/components/GameCard';
import { GameModal } from '@/components/GameModal';
import { NavigationTabs, TabData } from '@/components/NavigationTabs';
import { gamesData } from '@/data/gamesData';

const tabs: TabData[] = [
  { id: 'middle1', label: '중학교 1학년', description: '정수, 유리수, 문자와 식, 일차방정식과 관련 게임' },
  { id: 'middle2', label: '중학교 2학년', description: '연립방정식, 일차함수, 확률과 통계 관련 게임' },
  { id: 'middle3', label: '중학교 3학년', description: '이차방정식, 이차함수, 원의 성질 관련 게임' },
  { id: 'common-math', label: '공통수학', description: '고등학교 공통수학 과정 게임' },
  { id: 'algebra', label: '대수', description: '다항식, 방정식과 부등식 관련 게임' },
  { id: 'calculus1', label: '미적분 I', description: '극한, 미분과 관련된 게임' },
  { id: 'calculus2', label: '미적분 II', description: '적분과 관련된 게임' },
  { id: 'probability', label: '확률과 통계', description: '확률과 통계 개념 학습 게임' },
  { id: 'geometry', label: '기하', description: '평면기하, 공간기하 관련 게임' },
  { id: 'ai-math', label: '인공지능 수학', description: 'AI와 수학을 결합한 미래형 게임' }
];

const Index = () => {
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

  const currentGames = gamesData[activeTab] || [];
  const currentTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <header className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          🎮 Play Math Archive
        </h1>
        <p className="text-lg md:text-xl font-medium text-foreground mb-2 max-w-4xl mx-auto">
          이 공간은 현직 교사들과 제자들이 함께 제작한 디지털 수학 콘텐츠📐 아카이브입니다.
        </p>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          즐겁게 게임하며 개념을 익히고, 연산력과 사고력을 함께 키워보세요!💪
        </p>
      </header>

      {/* Navigation Tabs */}
      <NavigationTabs 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {currentTabData?.label}
          </h2>
          <p className="text-muted-foreground">
            {currentTabData?.description}
          </p>
        </div>

        {/* Games Grid */}
        {currentGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onClick={() => handleGameClick(game)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              게임 준비 중
            </h3>
            <p className="text-muted-foreground">
              이 섹션의 게임들은 현재 개발 중입니다. 곧 만나볼 수 있어요!
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 text-center border-t border-border mt-16">
        <p className="text-foreground mb-2">
          행복한 수학, 함께 만들어요 😊
        </p>
        <p className="text-sm text-muted-foreground">
          © 행복한윤쌤 |{' '}
          <a 
            href="https://blog.naver.com/happy_yoonssam" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline transition-colors"
          >
            https://blog.naver.com/happy_yoonssam
          </a>
        </p>
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
