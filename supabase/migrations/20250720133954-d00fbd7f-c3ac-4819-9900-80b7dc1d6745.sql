-- Create RPC functions for incrementing game statistics

-- Function to increment click count
CREATE OR REPLACE FUNCTION public.increment_click_count(game_id TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO public.game_stats (game_id, click_count, play_count)
  VALUES (game_id, 1, 0)
  ON CONFLICT (game_id)
  DO UPDATE SET 
    click_count = public.game_stats.click_count + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Function to increment play count
CREATE OR REPLACE FUNCTION public.increment_play_count(game_id TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO public.game_stats (game_id, click_count, play_count)
  VALUES (game_id, 0, 1)
  ON CONFLICT (game_id)
  DO UPDATE SET 
    play_count = public.game_stats.play_count + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;