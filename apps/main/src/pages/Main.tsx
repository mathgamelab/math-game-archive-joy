import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { gamesData } from '@/data/gamesData';
import { useGameStats } from '@/hooks/useGameStats';
import { GameCard, GameData } from '@/components/GameCard';
import { GameModal } from '@/components/GameModal';
import recommendedGames from '@/data/recommendedGames.json';
import { SiteFooter } from '@/components/SiteFooter';

const Main = () => {
  const navigate = useNavigate();
  const { getPopularGames, incrementPlayCount, getGameStats } = useGameStats();
  const allGames = Object.values(gamesData).flat().filter((game) => game.status === 'playable');

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
    if (game.url) window.open(game.url, '_blank');
  };

  const recommended = allGames
    .filter((game) => recommendedGames.includes(game.id))
    .map((game) => ({ ...game, stats: getGameStats(game.id) }));

  const popularGames = getPopularGames(allGames, 6);

  return (
    <div className="page-shell">
      {/* Hero */}
      <section className="relative min-h-[72svh] overflow-hidden text-white sm:min-h-[78svh]">
        <video
          className="absolute inset-0 z-0 h-full w-full object-cover"
          src="/videos/high_school_math_ver2.mp4"
          poster="/images/main-poster.jpg"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          onLoadedMetadata={(e) => {
            e.currentTarget.muted = true;
            e.currentTarget.volume = 0;
          }}
        />
        <div className="absolute inset-0 z-10 bg-[#2C2825]/55" />
        <div className="container relative z-20 mx-auto flex min-h-[72svh] flex-col justify-end px-6 pb-16 pt-24 sm:min-h-[78svh] sm:pb-20">
          <div className="max-w-2xl animate-fade-in">
            <p className="mb-3 text-sm font-medium tracking-wide text-white/75">
              Math Game Archive
            </p>
            <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              현직 교사가 만든
              <br />
              교육용 수학 게임
            </h1>
            <p className="mb-8 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">
              교육과정과 성취기준에 맞춰 설계한 게임을 한곳에서 찾아보고 바로 플레이하세요.
            </p>
            <Button
              onClick={() => navigate('/games')}
              className="rounded-full bg-white px-7 py-6 text-base font-semibold text-foreground hover:bg-secondary"
            >
              게임 찾아보기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="section-pad border-b border-border/70 bg-card">
        <div className="container mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            수학을 친숙하게, 재미있게, 푹 빠져들게!
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            <p>
              Math Game Archive는 수학 교사들이 직접 제작한 교육용 수학 게임을 즐길 수 있는
              플랫폼입니다.
            </p>
            <p>
              교육과정과 단원별 성취수준에 기반한 구성으로 진정한 의미의 ‘학습’이 일어나도록
              게임을 설계했습니다.
            </p>
            <p>
              기존의 지루하고 어려운 수학 학습에서 잠시 벗어나,{' '}
              <span className="font-semibold text-foreground">수학의 진짜 재미</span>를 느낄 수
              있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Features — claymorphism cards */}
      <section className="section-pad border-b border-border/70 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            기존의 교육용 게임들과 무엇이 다른가요?
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
            {[
              {
                title: '교육과정 기반',
                description:
                  '재미만 있는 게임이 아니라, 2022 개정 교육과정의 핵심 개념과 단원 흐름에 맞춰 설계합니다. 수업과 가정 학습에서 바로 이어질 수 있도록 교과 맥락을 먼저 둡니다.',
                image: '/images/clay/clay-curriculum.png',
                bg: 'bg-[#EEF5FF]',
              },
              {
                title: '성취수준 반영',
                description:
                  "점수나 스테이지 클리어보다, 학생이 어떤 성취수준에 도달했는지가 목표입니다. 각 게임이 겨냥하는 학습 목표를 분명히 해 의미 있는 연습이 되도록 합니다.",
                image: '/images/clay/clay-achievement.png',
                bg: 'bg-[#FFF4EC]',
              },
              {
                title: '게이미피케이션',
                description:
                  "‘게임을 잘하고 싶다’는 몰입이 ‘수학을 배우고 싶다’는 동기로 이어지길 바랍니다. 규칙과 전략을 즐기는 과정에서 자연스럽게 개념이 자리 잡도록 설계합니다.",
                image: '/images/clay/clay-game.png',
                bg: 'bg-[#EEFBF4]',
              },
              {
                title: '교사 제작',
                description:
                  '현직 교사가 교실 경험을 바탕으로 직접 만들고 다듬은 콘텐츠입니다. 성적만 올리기보다, 수학과 다시 친해지는 경험을 선물하는 것을 더 중요하게 생각합니다.',
                image: '/images/clay/clay-teacher.png',
                bg: 'bg-[#F4F0FF]',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`clay-card relative min-h-[220px] p-5 sm:min-h-[240px] sm:p-6 md:min-h-[260px] lg:min-h-[280px] ${feature.bg}`}
              >
                <div className="relative z-10 flex h-full w-[62%] flex-col pr-2 sm:w-[58%] md:w-[55%]">
                  <h3 className="mb-2 text-lg font-semibold text-foreground sm:text-xl">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                    {feature.description}
                  </p>
                </div>
                <img
                  src={feature.image}
                  alt=""
                  className="pointer-events-none absolute bottom-1 right-1 h-[120px] w-auto max-w-[38%] object-contain object-right-bottom drop-shadow-sm sm:bottom-2 sm:right-2 sm:h-[140px] md:h-[160px] lg:h-[175px]"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="section-pad border-b border-border/70 bg-secondary/40">
        <div className="container mx-auto max-w-3xl px-6">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            현직 교사들이 교육과정에 기반하여
            <br />
            <span className="text-primary">진짜 교육용 수학 게임</span>을 제작합니다.
          </h2>
          <div className="space-y-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            <p>
              첫째, 교육과정에 충실한 게임을 만듭니다.
              <br />
              모든 게임은 2022개정교육과정에 명시된 핵심 개념을 바탕으로 제작합니다.
              <br />
              각 게임이 어떤 성취수준을 목표로 하는지 명확히 제시하여 의미 있는 학습을 돕습니다.
            </p>
            <p>
              둘째, 학습 동기로 이어지는 게이미피케이션을 추구합니다.
              <br />
              저희가 추구하는 게이미피케이션은 ‘게임을 잘하고자 하는 동기’가
              <br />
              ‘수학을 배우려는 동기’로 전환되는 경험을 제공하는 것입니다.
              <br />
              학생들은 게임의 전략과 규칙에 따라 즐기는 과정에서 자연스럽게 수학을 이해하게 됩니다.
            </p>
            <p>
              셋째, 수학과 친해지는 경험을 선물합니다.
              <br />
              물론 게임만으로는 성적을 올릴 수 없습니다.
              <br />
              하지만 교과서를 펼치기 싫어하는 학생도 수학 게임에는 즐겁게 참여할 수 있습니다.
              <br />
              게임이라는 공통의 관심사를 두고 수학을 함께 즐기는 시간,
              <br />
              그 자체로 가장 중요한 학습 동기가 형성될 수 있음을 믿습니다.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium text-foreground">
            <span className="rounded-full border border-border bg-card px-3 py-1.5">교사 제작</span>
            <span className="rounded-full border border-border bg-card px-3 py-1.5">품질 보증</span>
            <span className="rounded-full border border-border bg-card px-3 py-1.5">몰입하는 학습</span>
          </div>
        </div>
      </section>

      {/* Recommended */}
      <section className="section-pad">
        <div className="container mx-auto px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                추천 게임
              </h2>
              <p className="mt-2 text-muted-foreground">수업과 가정에서 바로 쓰기 좋은 콘텐츠</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/games')}
              className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex"
            >
              전체 보기
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((game) => (
              <GameCard key={game.id} game={game} onClick={handleGameClick} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular */}
      <section className="section-pad border-t border-border/70 bg-card/60">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              인기 게임
            </h2>
            <p className="mt-2 text-muted-foreground">많이 플레이된 게임을 모았습니다</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularGames.map((game) => (
              <GameCard key={game.id} game={game} onClick={handleGameClick} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-3 text-2xl font-semibold sm:text-3xl">교과·난이도로 바로 찾아보세요</h2>
          <p className="mx-auto mb-8 max-w-xl text-primary-foreground/80">
            중학·고등·뇌풀기 게임까지, 필요한 콘텐츠를 빠르게 골라 플레이할 수 있습니다.
          </p>
          <Button
            onClick={() => navigate('/games')}
            className="rounded-full bg-white px-7 py-6 text-base font-semibold text-foreground hover:bg-secondary"
          >
            게임 목록 열기
          </Button>
        </div>
      </section>

      <SiteFooter />

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
