import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Users, 
  Target, 
  Sparkles,
  Heart,
  Award,
  Lightbulb,
  Play,
  Star,
  Clock,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { gamesData } from '@/data/gamesData';
import { useGameStats } from '@/hooks/useGameStats';
import { GameCard, GameData } from '@/components/GameCard';
import { GameModal } from '@/components/GameModal';
import recommendedGames from '@/data/recommendedGames.json';

const Main = () => {
  const navigate = useNavigate();
  const { getPopularGames, incrementPlayCount } = useGameStats();
  const allGames = Object.values(gamesData).flat();

  // 모달 상태 및 핸들러 추가
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

  const handlePlayClick = (game: GameData) => {
    incrementPlayCount(game.id);
    if (game.url) {
      window.open(game.url, '_blank');
    }
  };

  // 추천 게임 필터링 (JSON에서 불러옴)
  const getRecommendedGames = () => {
    return allGames.filter(game => recommendedGames.includes(game.id));
  };

  // 인기 게임 (클릭 수 기준)
  const popularGames = getPopularGames(allGames, 6);

  const features = [
    {
      icon: <BookOpen className="h-8 w-8 text-blue-600" />,
      title: "교육과정 기반",
      description: "교육과정에서 제시하는 핵심 개념에 기반하여 게임을 제작합니다."
    },
    {
      icon: <Target className="h-8 w-8 text-purple-600" />,
      title: "성취수준 반영",
      description: "모든 게임은 '성취수준'의 도달을 기본 목표로 합니다."
    },
    {
      icon: <Sparkles className="h-8 w-8 text-green-600" />,
      title: "게이미피케이션",
      description: "게임의 몰입감을 수학으로 옮겨갈 수 있게 합니다."
    },
    {
      icon: <Users className="h-8 w-8 text-orange-600" />,
      title: "교사 제작",
      description: "선생님이 직접 제작한 신뢰할 수 있는 콘텐츠입니다."
    }
  ];

  const stats = [
    { number: "20+", label: "등록된 게임", icon: <Play className="h-6 w-6" /> },
    { number: "100+", label: "플레이 횟수", icon: <Users className="h-6 w-6" /> },
    { number: "20+", label: "플레이 시간", icon: <Clock className="h-6 w-6" /> },
    { number: "10+", label: "참여 교사", icon: <Heart className="h-6 w-6" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - EBSMath 스타일 */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="container mx-auto px-6 py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <div className="text-8xl animate-bounce">🎮</div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Math Game Archive
            </h1>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed opacity-90">
              현직 교사들이 직접 만든 <span className="font-semibold text-yellow-300">진짜 교육용 수학 게임</span>을 
              즐겨보세요!
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <Button 
                onClick={() => navigate('/games')}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-medium shadow-lg"
              >
                게임 시작하기
              </Button>
              <Button 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full text-lg font-medium"
              >
                더 알아보기
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 간단한 소개글 섹션 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              수학을 친숙하게, 재미있게, 몰입해서!
            </h2>
            <div className="prose prose-lg mx-auto text-gray-600 leading-relaxed">
              <p className="text-xl mb-6">
                Math Game Archive는 수학 교사들이 직접 제작한
                교육용 수학 게임을 즐길 수 있는 플랫폼입니다.
              </p>
              <p className="text-lg mb-6">
                교육과정과 단원별 성취수준에 기반한 구성으로
                진정한 의미의 '학습'이 일어나도록 게임을 설계했습니다.
              </p>
              <p className="text-lg mb-6">
                기존의 지루하고 어려운 수학 학습에서 잠시 벗어나, 
                <span className="font-semibold text-blue-600"> 수학의 진짜 재미를</span> 
                느낄 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg text-blue-600">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 추천 콘텐츠 섹션 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                추천 콘텐츠
              </h2>
              <p className="text-lg text-gray-600">
                선생님이 추천하는 인기 수학 게임을 만나보세요
              </p>
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <span>더보기</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {getRecommendedGames().map((game) => (
              <GameCard 
                key={game.id} 
                game={game}
                onClick={handleGameClick}
                onPlayClick={handlePlayClick}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 인기 콘텐츠 섹션 */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                인기 콘텐츠
              </h2>
              <p className="text-lg text-gray-600">
                많은 학생들이 즐기고 있는 인기 게임입니다
              </p>
            </div>
            <div className="flex items-center space-x-2 text-blue-600">
              <TrendingUp className="h-5 w-5" />
              <span className="font-medium">실시간 인기</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularGames.map((game) => (
              <GameCard 
                key={game.id} 
                game={game}
                onClick={handleGameClick}
                onPlayClick={handlePlayClick}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              기존의 교육용 게임들과 무엇이 다른가요?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  현직 교사들이 만드는<br />
                  <span className="text-blue-600">신뢰할 수 있는 콘텐츠</span>
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Math Game Archive는 현직 수학 교사들이 직접 제작한 디지털 수학 콘텐츠를 
                  게임 형태로 제공하는 플랫폼입니다.
                </p>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  교과서 순서에 맞춘 체계적인 구성과 단계별 난이도 설정으로 
                  모든 학생들이 자신의 수준에 맞는 학습을 할 수 있습니다.
                </p>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Heart className="h-5 w-5" />
                    <span className="font-medium">교사 제작</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-600">
                    <Award className="h-5 w-5" />
                    <span className="font-medium">품질 보증</span>
                  </div>
                  <div className="flex items-center space-x-2 text-purple-600">
                    <Lightbulb className="h-5 w-5" />
                    <span className="font-medium">창의적 학습</span>
                  </div>
                </div>
              </div>
              {/* 학습 목표(🎯) 섹션 완전 삭제 */}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            지금 바로 플레이해보세요!
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            무료로 제공되는 다양한 수학 게임을 통해 <br/>
            재미있고 효과적인 학습을 경험해보세요.
          </p>
          <Button 
            onClick={() => navigate('/games')}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-medium shadow-lg"
          >
            게임 둘러보기
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
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
    </div>
  );
};

export default Main; 