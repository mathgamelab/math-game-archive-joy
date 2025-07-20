-- 게임 통계 테이블 생성
CREATE TABLE public.game_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id TEXT NOT NULL UNIQUE,
  play_count INTEGER NOT NULL DEFAULT 0,
  click_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.game_stats ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 통계를 볼 수 있도록 정책 생성
CREATE POLICY "Anyone can view game stats" 
ON public.game_stats 
FOR SELECT 
USING (true);

-- 모든 사용자가 통계를 업데이트할 수 있도록 정책 생성
CREATE POLICY "Anyone can update game stats" 
ON public.game_stats 
FOR UPDATE 
USING (true);

-- 게임 통계를 삽입할 수 있도록 정책 생성
CREATE POLICY "Anyone can insert game stats" 
ON public.game_stats 
FOR INSERT 
WITH CHECK (true);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 생성
CREATE TRIGGER update_game_stats_updated_at
    BEFORE UPDATE ON public.game_stats
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 기존 게임들의 초기 통계 데이터 삽입
INSERT INTO public.game_stats (game_id, play_count, click_count) VALUES
('apple_game', 0, 0),
('coordinate_chess', 0, 0),
('domineering', 0, 0),
('math_city', 0, 0),
('number_flow', 0, 0),
('number_flow_integer', 0, 0),
('number_of_cases_challenge', 0, 0),
('polynomial_duel', 0, 0);