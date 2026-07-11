import React, { useState, useEffect, useMemo } from 'react';
import { GameCard, GameData } from '@/components/GameCard';
import { GameModal } from '@/components/GameModal';
import { NavigationTabs, TabData } from '@/components/NavigationTabs';
import { gamesData } from '@/data/gamesData';
import { Search } from 'lucide-react';
import { getPlayCount, incrementPlayCount } from '../lib/playCount';
import { SiteFooter } from '@/components/SiteFooter';

const middleSchoolTabs: TabData[] = [
  { id: 'middle1', label: '중학교 1학년', description: '정수, 유리수, 문자와 식, 일차방정식' },
  { id: 'middle2', label: '중학교 2학년', description: '연립방정식, 일차함수, 확률과 통계' },
  { id: 'middle3', label: '중학교 3학년', description: '이차방정식, 이차함수, 원의 성질' },
];

const highSchoolTabs: TabData[] = [
  { id: 'common-math', label: '공통수학', description: '고등학교 공통수학 과정' },
  { id: 'algebra', label: '대수', description: '다항식, 방정식과 부등식' },
  { id: 'calculus1', label: '미적분 I', description: '극한, 미분' },
  { id: 'calculus2', label: '미적분 II', description: '적분' },
  { id: 'probability', label: '확률과 통계', description: '확률과 통계 개념' },
  { id: 'geometry', label: '기하', description: '평면기하, 공간기하' },
  { id: 'ai-math', label: '인공지능 수학', description: 'AI와 수학을 결합한 미래형 게임' },
];

const breakGameTabs: TabData[] = [
  { id: 'break-game', label: '뇌풀기 게임', description: '두뇌를 말랑말랑하게 만드는 게임' },
];

const mathDayTabs: TabData[] = [
  { id: 'mathday', label: 'MathDay', description: 'MathDay 행사·체험용 수학 게임' },
];

const classManagementTabs: TabData[] = [
  { id: 'class-management', label: '학급운영', description: '학급운영 도구 및 활동' },
];

const gradeTabs = [
  { id: 'middle', label: '중학수학' },
  { id: 'high', label: '고등수학' },
  { id: 'break-game', label: '뇌풀기 게임' },
  { id: 'mathday', label: 'MathDay' },
  { id: 'class-management', label: '학급운영' },
];

const Index = () => {
  const [activeSection, setActiveSection] = useState('middle');
  const [activeTab, setActiveTab] = useState('middle1');
  const [selectedGame, setSelectedGame] = useState<GameData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [playCounts, setPlayCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    const tab = urlParams.get('tab');

    if (section) setActiveSection(section);
    if (tab) {
      setActiveTab(tab);
    } else if (section) {
      if (section === 'middle') setActiveTab('middle1');
      else if (section === 'high') setActiveTab('common-math');
      else if (section === 'break-game') setActiveTab('break-game');
      else if (section === 'mathday') setActiveTab('mathday');
      else if (section === 'class-management') setActiveTab('class-management');
    }
  }, []);

  const handleGameClick = (game: GameData) => {
    setSelectedGame(game);
    setIsModalOpen(true);
  };

  let currentTabs: TabData[] = [];
  if (activeSection === 'middle') currentTabs = middleSchoolTabs;
  else if (activeSection === 'high') currentTabs = highSchoolTabs;
  else if (activeSection === 'break-game') currentTabs = breakGameTabs;
  else if (activeSection === 'mathday') currentTabs = mathDayTabs;
  else if (activeSection === 'class-management') currentTabs = classManagementTabs;

  const currentGames = gamesData[activeTab] || [];
  const currentTabData = currentTabs.find((tab) => tab.id === activeTab);

  const filteredGames = useMemo(() => {
    return currentGames.filter((game) => {
      if (game.status !== 'playable') return false;
      const matchesSearch =
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty =
        selectedDifficulty === 'all' || game.difficulty === selectedDifficulty;
      return matchesSearch && matchesDifficulty;
    });
  }, [currentGames, searchTerm, selectedDifficulty]);

  useEffect(() => {
    let isMounted = true;
    async function fetchCounts() {
      const results = await Promise.all(
        filteredGames.map(async (game) => {
          try {
            const count = await getPlayCount(game.id);
            return [game.id, count];
          } catch {
            return [game.id, 0];
          }
        })
      );
      if (isMounted) setPlayCounts(Object.fromEntries(results));
    }
    fetchCounts();
    return () => {
      isMounted = false;
    };
  }, [filteredGames]);

  const handlePlayClick = async (game: GameData) => {
    try {
      await incrementPlayCount(game.id);
      const newCount = await getPlayCount(game.id);
      setPlayCounts((prev) => ({ ...prev, [game.id]: newCount }));
    } catch (error) {
      console.error('플레이 카운트 업데이트 실패:', error);
    }
    if (game.url) window.open(game.url, '_blank');
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedGame(null);
  };

  const handleGradeTabChange = (gradeId: string) => {
    setActiveSection(gradeId);
    if (gradeId === 'middle') setActiveTab('middle1');
    else if (gradeId === 'high') setActiveTab('common-math');
    else if (gradeId === 'break-game') setActiveTab('break-game');
    else if (gradeId === 'mathday') setActiveTab('mathday');
    else if (gradeId === 'class-management') setActiveTab('class-management');
  };

  return (
    <div className="page-shell">
      {/* Page header */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-10 sm:py-12">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            게임 찾아보기
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            교과·학년·난이도로 교육용 수학 게임을 골라보세요.
          </p>
        </div>
      </section>

      {/* Toolbar: section chips + search + difficulty */}
      <section className="sticky top-14 z-40 border-b border-border bg-white/90 backdrop-blur-md sm:top-16">
        <div className="container mx-auto space-y-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {gradeTabs.map((tab) => {
              const active = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleGradeTabChange(tab.id)}
                  className={`chip shrink-0 ${active ? 'chip-active' : 'hover:border-primary/25 hover:text-foreground'}`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="게임 검색"
                className="w-full rounded-full border border-border bg-card py-2 pl-9 pr-4 text-sm text-foreground outline-none ring-ring placeholder:text-muted-foreground focus:ring-2"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', '초급', '중급', '고급'].map((difficulty) => {
                const active = selectedDifficulty === difficulty;
                return (
                  <button
                    key={difficulty}
                    type="button"
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={`chip ${active ? 'chip-active' : 'hover:border-primary/25 hover:text-foreground'}`}
                  >
                    {difficulty === 'all' ? '전체 난이도' : difficulty}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <NavigationTabs tabs={currentTabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="container mx-auto px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
              {currentTabData?.label || '게임 목록'}
            </h2>
            {currentTabData?.description && (
              <p className="mt-1 text-sm text-muted-foreground">{currentTabData.description}</p>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{filteredGames.length}개</p>
        </div>

        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={{
                  ...game,
                  stats: { ...game.stats, playCount: playCounts[game.id] ?? 0 },
                }}
                onClick={handleGameClick}
                onPlayClick={handlePlayClick}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <h3 className="text-lg font-semibold text-foreground">검색 결과가 없습니다</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              다른 검색어나 난이도 필터를 시도해보세요
            </p>
          </div>
        )}
      </main>

      {selectedGame && (
        <GameModal
          game={selectedGame}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onPlay={() => {
            handlePlayClick(selectedGame);
            handleModalClose();
          }}
        />
      )}

      <SiteFooter />
    </div>
  );
};

export default Index;
