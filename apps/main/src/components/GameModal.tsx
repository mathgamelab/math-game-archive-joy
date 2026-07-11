import React from 'react';
import { X, Play, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GameData } from './GameCard';

interface GameModalProps {
  game: GameData | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay?: () => void;
}

export const GameModal: React.FC<GameModalProps> = ({ game, isOpen, onClose, onPlay }) => {
  if (!isOpen || !game) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handlePlayGame = () => {
    if (onPlay) onPlay();
    else if (game.url) window.open(game.url, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 animate-in fade-in duration-200"
      onClick={handleOverlayClick}
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-[var(--shadow-modal)] animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary text-2xl">
              {game.clayIcon ||
              {
                number_flow_integer: '/images/clay/games/number_flow_integer.png',
                'shape-scanner': '/images/clay/games/shape-scanner.png',
                'apple-game': '/images/clay/games/apple-game.png',
                'number-flow': '/images/clay/games/number-flow.png',
                '3d-tictactoe': '/images/clay/games/3d-tictactoe.png',
                'ultimate-3d-tictactoe': '/images/clay/games/ultimate-3d-tictactoe.png',
                'ultimate-tictactoe': '/images/clay/games/ultimate-tictactoe.png',
                domineering: '/images/clay/games/domineering.png',
                'animal-shogi': '/images/clay/games/animal-shogi.png',
                'polynomial-card-battle': '/images/clay/games/polynomial-card-battle.png',
                'math-city': '/images/clay/games/math-city.png',
                'coordinate-chess': '/images/clay/games/coordinate-chess.png',
                number_of_cases_challenge: '/images/clay/games/number_of_cases_challenge.png',
                set_master: '/images/clay/games/set_master.png',
              }[game.id] ? (
                <img
                  src={
                    game.clayIcon ||
                    {
                      number_flow_integer: '/images/clay/games/number_flow_integer.png',
                      'shape-scanner': '/images/clay/games/shape-scanner.png',
                      'apple-game': '/images/clay/games/apple-game.png',
                      'number-flow': '/images/clay/games/number-flow.png',
                      '3d-tictactoe': '/images/clay/games/3d-tictactoe.png',
                      'ultimate-3d-tictactoe': '/images/clay/games/ultimate-3d-tictactoe.png',
                      'ultimate-tictactoe': '/images/clay/games/ultimate-tictactoe.png',
                      domineering: '/images/clay/games/domineering.png',
                      'animal-shogi': '/images/clay/games/animal-shogi.png',
                      'polynomial-card-battle': '/images/clay/games/polynomial-card-battle.png',
                      'math-city': '/images/clay/games/math-city.png',
                      'coordinate-chess': '/images/clay/games/coordinate-chess.png',
                      number_of_cases_challenge: '/images/clay/games/number_of_cases_challenge.png',
                      set_master: '/images/clay/games/set_master.png',
                    }[game.id]
                  }
                  alt=""
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                game.icon
              )}
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-foreground sm:text-xl">{game.title}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border border-border px-2 py-0.5">{game.difficulty}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {game.estimatedTime}
                </span>
                <span
                  className={
                    game.status === 'playable' ? 'text-emerald-700' : 'text-amber-700'
                  }
                >
                  {game.status === 'playable' ? '플레이 가능' : '개발 중'}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          <div className="rounded-xl bg-secondary/50 p-4">
            <p
              className="whitespace-pre-line text-sm leading-relaxed text-foreground/85"
              style={{ wordBreak: 'keep-all' }}
            >
              {game.description}
            </p>
          </div>
        </div>

        <div className="flex gap-3 border-t border-border px-5 py-4 sm:px-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-border bg-card text-foreground hover:bg-secondary"
          >
            닫기
          </Button>
          {game.status === 'playable' && (game.url || onPlay) && (
            <Button
              onClick={handlePlayGame}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Play className="mr-2 h-4 w-4" />
              플레이하기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
