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
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import ContactModal from '@/components/ContactModal';
import ContactFormModal from '@/components/ContactFormModal';

const Main = () => {
  const navigate = useNavigate();
  const { getPopularGames, incrementPlayCount, getGameStats } = useGameStats();
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
    return allGames
      .filter(game => recommendedGames.includes(game.id))
      .map(game => ({
        ...game,
        stats: getGameStats(game.id)
      }));
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
      <section className="relative overflow-hidden text-white">
        {/* 배경 동영상 */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/videos/high_school_math.mp4" // 파일명/경로에 맞게 수정
          autoPlay
          loop
          muted
          playsInline
        />
        {/* 오버레이 더 어둡게 */}
        <div className="absolute inset-0 bg-black bg-opacity-45 z-10"></div>
        <div className="container mx-auto px-6 py-20 relative z-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* 타이틀/설명에 drop-shadow 추가 */}
            <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-lg">
              Math Game Archive
            </h1>
            <p className="text-xl md:text-4xl mb-12 max-w-3xl mx-auto leading-relaxed opacity-90 drop-shadow-lg">
              현직 교사들이 직접 만든<br/> <span className="font-semibold text-yellow-300">진짜 교육용 수학 게임</span>을 
              즐겨보세요!
            </p>
            {/* 버튼을 단독 중앙 배치 */}
            <div className="flex justify-center">
              <Button 
                onClick={() => navigate('/games')}
                className="bg-transparent border border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full text-xl font-bold shadow-lg transition-colors"
              >
                게임 시작하기
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
              수학을 친숙하게, 재미있게, 푹 빠져들게!
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
      <section className="py-16 bg-white overflow-hidden">
        <div className="container mx-auto px-6 mb-3">
          <div className="flex items-center justify-between">
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
        </div>
        
        <div className="container mx-auto px-3">
          <div className="relative py-1">
            <Carousel className="overflow-visible">
              <CarouselContent className="-ml-4 md:-ml-6 !overflow-visible">
                {getRecommendedGames().map((game) => (
                  <CarouselItem key={game.id} className="pl-4 md:pl-6 basis-2/3 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <div className="p-2">
                      <GameCard 
                        game={game}
                        onClick={handleGameClick}
                        onPlayClick={handlePlayClick}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </section>

      {/* 인기 콘텐츠 섹션 */}
      <section className="py-16 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-6 mb-6">
          <div className="flex items-center justify-between">
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
        </div>
        
        <div className="container mx-auto px-6">
          <div className="relative py-2">
            <Carousel className="overflow-visible">
              <CarouselContent className="-ml-4 md:-ml-6 !overflow-visible">
                {popularGames.map((game) => (
                  <CarouselItem key={game.id} className="pl-4 md:pl-6 basis-2/3 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <div className="p-2">
                      <GameCard 
                        game={game}
                        onClick={handleGameClick}
                        onPlayClick={handlePlayClick}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
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
          
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardHeader className="text-center pb-2 md:pb-4">
                  <div className="flex justify-center mb-2 md:mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-sm md:text-xl font-bold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <CardDescription className="text-xs md:text-base text-gray-600 leading-relaxed">
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
        {/* 웹폰트 CDN 적용 (예: Cafe24 단정해체) */}
        <link href="https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2104@1.1/Cafe24Dangdanghae.woff" rel="stylesheet" as="style" type="text/css" crossOrigin="anonymous" />
        <style>{`
          .about-truefont {
            font-family: 'Cafe24Dangdanghae', 'Nanum Myeongjo', 'serif';
            letter-spacing: 0.01em;
            font-weight: 400;
          }
        `}</style>
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="about-truefont">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                현직 교사들이 교육과정에 기반하여<br />
                <span className="text-blue-600">진짜 교육용 수학 게임</span>을 제작합니다.
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                첫째, 교육과정에 충실한 게임을 만듭니다.<br/>
                모든 게임은 2022개정교육과정에 명시된 핵심 개념을 바탕으로 제작합니다.<br/>
                각 게임이 어떤 성취수준을 목표로 하는지 명확히 제시하여 의미 있는 학습을 돕습니다.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                둘째, 학습 동기로 이어지는 게이미피케이션을 추구합니다.<br/>
                저희가 추구하는 게이피케이션은 '게임을 잘하고자 하는 동기'가<br/>
                '수학을 배우려는 동기'로 전환되는 경험을 제공하는 것 입니다.<br/>
                학생들은 게임의 전략과 규칙에 따라 즐기는 과정에서 자연스럽게 수학을 이해하기 됩니다.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                셋째, 수학과 친해지는 경험을 선물합니다.<br/>
                물론 게임만으로는 성적을 올릴 수 없습니다.<br/>
                하지만 교과서를 펼치기 싫어하는 학생도 수학 게임에는 즐겁게 참여할 수 있습니다.<br/>
                게임이라는 공통의 관심사를 두고 수학을 함께 즐기는 시간,<br/>
                그 자체로 가장 중요한 학습 동기가 형성될 수 있음을 믿습니다.
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
                  <span className="font-medium">몰입하는 학습</span>
                </div>
              </div>
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
            교육과정에 기반한 다양한 수학 게임을 즐기며 <br/>
            재미있고 효과적인 학습을 경험해보세요.
          </p>
          <Button 
            onClick={() => navigate('/games')}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-medium shadow-lg"
          >
            게임 시작하기
          </Button>
        </div>
      </section>

      {/* Footer */}
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