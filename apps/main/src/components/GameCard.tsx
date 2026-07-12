import React from 'react';
import { Clock, Play } from 'lucide-react';

export interface GameData {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'playable' | 'development';
  difficulty: string;
  estimatedTime: string;
  category?: string;
  content?: string;
  terms?: string;
  standard?: string;
  type?: string;
  summary?: string;
  url?: string;
  clayIcon?: string;
  stats?: {
    playCount: number;
  };
  mobile?: '지원' | '제한';
}

interface GameCardProps {
  game: GameData;
  onClick: (game: GameData) => void;
  onPlayClick?: (game: GameData) => void;
}

const CLAY_ICONS: Record<string, string> = {
  number_flow_integer: '/images/clay/games/number_flow_integer.png',
  'shape-scanner': '/images/clay/games/shape-scanner.png',
  'apple-game': '/images/clay/games/apple-game.png',
  'number-flow': '/images/clay/games/number-flow.png',
  '3d-tictactoe': '/images/clay/games/3d-tictactoe.png',
  'ultimate-3d-tictactoe': '/images/clay/games/ultimate-3d-tictactoe.png',
  'ultimate-tictactoe': '/images/clay/games/ultimate-tictactoe.png',
  domineering: '/images/clay/games/domineering.png',
  'animal-shogi': '/images/clay/games/animal-shogi.png',
  'dots-and-boxes': '/images/clay/games/dots-and-boxes.png',
  suyeon: '/images/clay/games/suyeon.png',
  'linear-flicking-marbles': '/images/clay/games/linear-flicking-marbles.png',
  'pi-bulloon': '/images/clay/games/pi-bulloon.png',
  'pi-draw': '/images/clay/games/pi-draw.png',
  'pi-timer': '/images/clay/games/pi-timer.png',
  'polynomial-card-battle': '/images/clay/games/polynomial-card-battle.png',
  'math-city': '/images/clay/games/math-city.png',
  'coordinate-chess': '/images/clay/games/coordinate-chess.png',
  number_of_cases_challenge: '/images/clay/games/number_of_cases_challenge.png',
  set_master: '/images/clay/games/set_master.png',
  'binary-number-quiz': '/images/clay/games/binary-number-quiz.png',
  'topology-simulator': '/images/clay/games/topology-simulator.png',
};

export const getClayIcon = (game: Pick<GameData, 'id' | 'clayIcon'>) =>
  game.clayIcon || CLAY_ICONS[game.id];

export const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => {
  const subjectMatch = game.description.match(/📘\s*교과명\s*:\s*(.+)/);
  const rawSubject = subjectMatch?.[1]?.trim() || game.category || '';
  const subject =
    rawSubject && !/뇌풀기|몸\s*풀기/.test(rawSubject) ? rawSubject : null;
  const claySrc = getClayIcon(game);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onClick(game)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(game);
        }
      }}
      className="hover-lift group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]"
    >
      <div className="relative flex h-40 items-center justify-center bg-gradient-to-b from-secondary/80 to-secondary/30 sm:h-48 md:h-52">
        {claySrc ? (
          <img
            src={claySrc}
            alt=""
            className="h-[78%] w-auto max-w-[85%] object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="text-5xl sm:text-6xl">{game.icon}</span>
        )}

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1">
          {game.status === 'development' && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">
              개발 중
            </span>
          )}
          {game.mobile === '지원' && (
            <span className="rounded-full bg-card/90 px-2 py-0.5 text-[11px] text-muted-foreground backdrop-blur-sm">
              📱 모바일 가능
            </span>
          )}
        </div>

        <div className="absolute right-3 top-3">
          <span className="rounded-full border border-border bg-card/90 px-2 py-0.5 text-[11px] font-medium text-foreground backdrop-blur-sm">
            {game.difficulty}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 text-left text-base font-semibold leading-snug text-foreground group-hover:text-primary sm:text-lg">
            {game.title}
          </h3>
          {subject && (
            <span className="max-w-[45%] shrink-0 pt-0.5 text-right text-xs leading-snug text-muted-foreground sm:text-sm">
              {subject}
            </span>
          )}
        </div>

        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {game.summary || game.description.split('\n')[0]}
        </p>

        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {game.estimatedTime}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Play className="h-3.5 w-3.5" />
            {game.stats?.playCount || 0}
          </span>
        </div>
      </div>
    </article>
  );
};
