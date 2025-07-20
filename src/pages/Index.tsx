import React, { useState, useEffect, useMemo } from 'react';
import { GameCard, GameData } from '@/components/GameCard';
import { GameModal } from '@/components/GameModal';
import { NavigationTabs, TabData } from '@/components/NavigationTabs';
import { gamesData } from '@/data/gamesData';
import { useNavigate } from 'react-router-dom';
import { useGameStats } from '@/hooks/useGameStats';
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
  Sparkles,
  Heart,
  Zap,
  Calendar,
  ArrowRight,
  Search,
  Filter
} from "lucide-react";
import { getPlayCount, incrementPlayCount } from '../lib/playCount';

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
  { id: 'break-game', label: '뇌풀기 게임', description: '두뇌를 말랑말랑하게 만드는 게임' }
];

const classManagementTabs: TabData[] = [
  { id: 'class-management', label: '학급운영', description: '학급운영 도구 및 활동' }
];

const mainTabs = [
  { id: 'middle', label: '중학수학' },
  { id: 'high', label: '고등수학' },
  { id: 'break-game', label: '뇌풀기 게임' },
  { id: 'class-management', label: '학급운영' },
];

// 추천 콘텐츠 (편집 가능)
const recommendedGames = [
  'number_flow_integer',
  'apple-game',
  'number-flow'
];

const gradeTabs = [
  { id: 'middle', label: '중학교' },
  { id: 'high', label: '고등학교' },
  { id: 'break-game', label: '뇌풀기 게임' },
  { id: 'class-management', label: '학급운영' },
];

const Index = () => {
  const [activeSection, setActiveSection] = useState('middle');
  const [activeTab, setActiveTab] = useState('middle1');
  const [selectedGame, setSelectedGame] = useState<GameData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const navigate = useNavigate();
  const [playCounts, setPlayCounts] = useState<Record<string, number>>({});

  const { 
    getPopularGames, 
    getRecentGames 
  } = useGameStats();

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

  const handleGameClick = (game: GameData) => {
    setSelectedGame(game);
    setIsModalOpen(true);
  };

  let currentTabs: TabData[] = [];
  if (activeSection === 'middle') currentTabs = middleSchoolTabs;
  else if (activeSection === 'high') currentTabs = highSchoolTabs;
  else if (activeSection === 'break-game') currentTabs = breakGameTabs;
  else if (activeSection === 'class-management') currentTabs = classManagementTabs;

  const currentGames = gamesData[activeTab] || [];
  const currentTabData = currentTabs.find(tab => tab.id === activeTab);

  // 검색 및 필터링
  const filteredGames = useMemo(() => {
    return currentGames.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           game.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           game.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = selectedDifficulty === 'all' || game.difficulty === selectedDifficulty;
      return matchesSearch && matchesDifficulty;
    });
  }, [currentGames, searchTerm, selectedDifficulty]);

  // playCounts 캐싱 최적화: 이미 불러온 게임은 다시 요청하지 않음
  useEffect(() => {
    let isMounted = true;
    async function fetchCounts() {
      // 모든 게임의 playCount를 병렬로 한 번에 불러옴
      const results = await Promise.all(
        filteredGames.map(async (game) => {
          try {
            const count = await getPlayCount(game.id);
            return [game.id, count];
          } catch (e) {
            // 406 등 에러 발생 시 0으로 처리
            return [game.id, 0];
          }
        })
      );
      if (isMounted) {
        // 결과를 객체로 변환해서 한 번만 setState
        setPlayCounts(Object.fromEntries(results));
      }
    }
    fetchCounts();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredGames]);

  // 플레이 후에는 해당 게임만 최신 값으로 갱신
  const handlePlayClick = async (game: GameData) => {
    try {
      await incrementPlayCount(game.id);
      const newCount = await getPlayCount(game.id);
      setPlayCounts((prev) => ({ ...prev, [game.id]: newCount }));
    } catch (error) {
      console.error('플레이 카운트 업데이트 실패:', error);
    }
    
    if (game.url) {
      window.open(game.url, '_blank');
    }
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

  // 학년별 탭 클릭 핸들러
  const handleGradeTabChange = (gradeId: string) => {
    setActiveSection(gradeId);
    if (gradeId === 'middle') setActiveTab('middle1');
    else if (gradeId === 'high') setActiveTab('common-math');
    else if (gradeId === 'break-game') setActiveTab('break-game');
    else if (gradeId === 'class-management') setActiveTab('class-management');
  };

  // 모든 게임 데이터 수집
  const allGames = Object.values(gamesData).flat();

  // 추천 게임 필터링
  const getRecommendedGames = () => {
    return allGames.filter(game => recommendedGames.includes(game.id));
  };

  // 인기 게임 (클릭 수 기준)
  const popularGames = getPopularGames(allGames, 6);

  // 최신 게임 (최근 플레이 기준)
  const recentGames = getRecentGames(allGames, 6);



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - 메인과 동일하게 상단에 노출 */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="container mx-auto px-6 pt-[50px] pb-[22px] relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <div className="text-8xl animate-bounce">🎮</div>
            </div>
            <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-lg">Math Game Archive</h1>
            <p className="text-xl md:text-4xl mb-12 max-w-3xl mx-auto leading-relaxed opacity-90 drop-shadow-lg">
              현직 교사들이 직접 만든<br/> <span className="font-semibold text-yellow-300">진짜 교육용 수학 게임</span>을 즐겨보세요!
            </p>
          </div>
        </div>
      </section>

      {/* 학년별 탭 */}
      <section className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex space-x-1 py-4">
            {gradeTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleGradeTabChange(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium text-sm tracking-tighter sm:text-lg sm:tracking-normal ${
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
                <span className="text-sm font-medium text-gray-700">
                  총 {filteredGames.length}개 게임
                </span>
              </div>
            </div>
          </div>

          {/* 필터 */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">난이도:</span>
            </div>
            <div className="flex space-x-2">
              {['all', '초급', '중급', '고급'].map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedDifficulty === difficulty
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {difficulty === 'all' ? '전체' : difficulty}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Games Grid */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {filteredGames.map((game) => (
              <GameCard 
                key={game.id} 
                game={{ ...game, stats: { ...game.stats, playCount: playCounts[game.id] ?? 0 } }}
                onClick={handleGameClick}
                onPlayClick={handlePlayClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-gray-600">
              다른 검색어나 필터를 시도해보세요
            </p>
          </div>
        )}
      </main>

      {/* Game Modal */}
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
      <footer className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center items-center space-x-3 mb-2">
            <div className="text-3xl">🎮</div>
            <h3 className="text-2xl font-bold leading-none">Math Game Archive</h3>
          </div>
          <p className="text-gray-300 mb-2 text-lg leading-none">
            행복한 수학, 함께 만들어요 😊
          </p>
          <p className="text-sm text-gray-400 leading-none">
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
    </div>
  );
};

export default Index;
