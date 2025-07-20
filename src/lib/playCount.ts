import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gpdjxoogukmjlalgufpq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwZGp4b29ndWttamxhbGd1ZnBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTY0ODMsImV4cCI6MjA2ODU5MjQ4M30.Mhus7eGCxZsabzml8A0ghR_C3nQ-eaGx4sALuuw89fU'
);

// 플레이 횟수 조회
export async function getPlayCount(gameId: string): Promise<number> {
  const { data, error } = await supabase
    .from('play_counts')
    .select('play_count')
    .eq('game_id', gameId)
    .single();
  if (error) {
    // 406 등 에러 발생 시 0 반환
    return 0;
  }
  return data ? data.play_count : 0;
}

// 플레이 횟수 증가
export async function incrementPlayCount(gameId: string): Promise<number> {
  const { data, error } = await supabase.rpc('increment_play_count', { gid: gameId });
  if (error) {
    console.error('플레이 카운트 증가 오류:', error);
    return 0;
  }
  return data;
} 