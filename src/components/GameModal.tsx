import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GameData } from './GameCard';

interface GameModalProps {
  game: GameData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GameModal: React.FC<GameModalProps> = ({ game, isOpen, onClose }) => {
  if (!isOpen || !game) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePlayGame = () => {
    if (game.url) {
      window.open(game.url, '_blank');
    }
  };

  const hasDetailedInfo = game.category || game.content || game.terms || game.standard || game.type;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300"
      onClick={handleOverlayClick}
    >
      <div className="bg-card rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-modal animate-in zoom-in-95 duration-300 ease-spring">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{game.icon}</span>
            <h2 className="text-xl font-bold text-card-foreground">{game.title}</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status */}
          <Badge 
            variant={game.status === 'playable' ? 'default' : 'secondary'}
            className={
              game.status === 'playable' 
                ? 'bg-success text-success-foreground' 
                : 'bg-warning text-warning-foreground'
            }
          >
            {game.status === 'playable' ? '플레이 가능' : '제작중'}
          </Badge>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">{game.description}</p>

          {/* Game Details */}
          {hasDetailedInfo ? (
            <div className="space-y-3 bg-muted/30 rounded-lg p-4">
              {game.category && (
                <div>
                  <span className="font-medium text-card-foreground">카테고리: </span>
                  <span className="text-muted-foreground">{game.category}</span>
                </div>
              )}
              {game.content && (
                <div>
                  <span className="font-medium text-card-foreground">내용: </span>
                  <span className="text-muted-foreground">{game.content}</span>
                </div>
              )}
              {game.terms && (
                <div>
                  <span className="font-medium text-card-foreground">용어: </span>
                  <span className="text-muted-foreground">{game.terms}</span>
                </div>
              )}
              {game.standard && (
                <div>
                  <span className="font-medium text-card-foreground">기준: </span>
                  <span className="text-muted-foreground">{game.standard}</span>
                </div>
              )}
              {game.type && (
                <div>
                  <span className="font-medium text-card-foreground">유형: </span>
                  <span className="text-muted-foreground">{game.type}</span>
                </div>
              )}
              <div>
                <span className="font-medium text-card-foreground">난이도: </span>
                <span className="text-muted-foreground">{game.difficulty}</span>
              </div>
              <div>
                <span className="font-medium text-card-foreground">예상 시간: </span>
                <span className="text-muted-foreground">{game.estimatedTime}</span>
              </div>
            </div>
          ) : (
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <p className="text-muted-foreground">
                이 게임은 현재 준비 중입니다. 곧 만나볼 수 있어요! 🚀
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            닫기
          </Button>
          {game.status === 'playable' && game.url && (
            <Button 
              onClick={handlePlayGame}
              className="flex-1 bg-gradient-primary hover:bg-gradient-primary hover:opacity-90"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              플레이하기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};