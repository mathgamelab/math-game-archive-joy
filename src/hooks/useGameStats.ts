import { useState, useEffect } from 'react';

export interface GameStats {
  clickCount: number;
  playCount: number;
  lastPlayed?: Date;
}

export interface GameStatsData {
  [gameId: string]: GameStats;
}

const STORAGE_KEY = 'math-game-stats';

export const useGameStats = () => {
  const [stats, setStats] = useState<GameStatsData>({});

  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const savedStats = localStorage.getItem(STORAGE_KEY);
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (error) {
        console.error('Failed to parse game stats:', error);
        setStats({});
      }
    }
  }, []);

  // 로컬 스토리지에 데이터 저장
  const saveStats = (newStats: GameStatsData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
    setStats(newStats);
  };

  // 게임 클릭 수 증가
  const incrementClickCount = (gameId: string) => {
    const currentStats = stats[gameId] || { clickCount: 0, playCount: 0 };
    const newStats = {
      ...stats,
      [gameId]: {
        ...currentStats,
        clickCount: currentStats.clickCount + 1,
      }
    };
    saveStats(newStats);
  };

  // 게임 플레이 횟수 증가
  const incrementPlayCount = (gameId: string) => {
    const currentStats = stats[gameId] || { clickCount: 0, playCount: 0 };
    const newStats = {
      ...stats,
      [gameId]: {
        ...currentStats,
        playCount: currentStats.playCount + 1,
        lastPlayed: new Date(),
      }
    };
    saveStats(newStats);
  };

  // 게임 통계 가져오기
  const getGameStats = (gameId: string): GameStats => {
    return stats[gameId] || { clickCount: 0, playCount: 0 };
  };

  // 인기 게임 (클릭 수 기준) 가져오기
  const getPopularGames = (allGames: any[], limit: number = 6) => {
    return allGames
      .map(game => ({
        ...game,
        stats: getGameStats(game.id)
      }))
      .sort((a, b) => b.stats.clickCount - a.stats.clickCount)
      .slice(0, limit);
  };

  // 최신 게임 (마지막 플레이 기준) 가져오기
  const getRecentGames = (allGames: any[], limit: number = 6) => {
    return allGames
      .map(game => ({
        ...game,
        stats: getGameStats(game.id)
      }))
      .filter(game => game.stats.lastPlayed)
      .sort((a, b) => new Date(b.stats.lastPlayed!).getTime() - new Date(a.stats.lastPlayed!).getTime())
      .slice(0, limit);
  };

  return {
    stats,
    incrementClickCount,
    incrementPlayCount,
    getGameStats,
    getPopularGames,
    getRecentGames,
  };
}; 