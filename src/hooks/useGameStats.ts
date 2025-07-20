import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GameStats {
  playCount: number;
}

export interface GameStatsData {
  [gameId: string]: GameStats;
}

export const useGameStats = () => {
  const [stats, setStats] = useState<GameStatsData>({});
  const [loading, setLoading] = useState(true);

  // Supabase에서 모든 게임 통계 로드
  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('play_counts')
        .select('game_id, play_count');

      if (error) {
        console.error('Failed to load game stats:', error);
        return;
      }

      const statsData: GameStatsData = {};
      data?.forEach(stat => {
        statsData[stat.game_id] = {
          playCount: stat.play_count,
        };
      });
      
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load game stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);



  // 게임 플레이 횟수 증가
  const incrementPlayCount = async (gameId: string) => {
    try {
      const { data, error } = await supabase.rpc('increment_play_count', { gid: gameId });
      
      if (error) {
        console.error('Failed to increment play count:', error);
        return;
      }

      // 로컬 상태 업데이트
      setStats(prev => ({
        ...prev,
        [gameId]: {
          ...prev[gameId],
          playCount: data || (prev[gameId]?.playCount || 0) + 1,
        }
      }));
    } catch (error) {
      console.error('Failed to increment play count:', error);
    }
  };

  // 게임 통계 가져오기
  const getGameStats = (gameId: string): GameStats => {
    return stats[gameId] || { playCount: 0 };
  };

  // 인기 게임 (플레이 수 기준) 가져오기
  const getPopularGames = (allGames: any[], limit: number = 6) => {
    return allGames
      .map(game => ({
        ...game,
        stats: getGameStats(game.id)
      }))
      .sort((a, b) => b.stats.playCount - a.stats.playCount)
      .slice(0, limit);
  };

  // 최신 게임 (플레이 횟수 기준) 가져오기
  const getRecentGames = (allGames: any[], limit: number = 6) => {
    return allGames
      .map(game => ({
        ...game,
        stats: getGameStats(game.id)
      }))
      .filter(game => game.stats.playCount > 0)
      .sort((a, b) => b.stats.playCount - a.stats.playCount)
      .slice(0, limit);
  };

  return {
    stats,
    loading,
    incrementPlayCount,
    getGameStats,
    getPopularGames,
    getRecentGames,
  };
};