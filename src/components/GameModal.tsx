import React from 'react';
import { X, ExternalLink, Play, Clock, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePlayGame = () => {
    if (onPlay) {
      onPlay();
    } else if (game.url) {
      window.open(game.url, '_blank');
    }
  };

  const getDifficultyStars = (difficulty: string) => {
    switch (difficulty) {
      case '초급': return '★☆☆☆☆';
      case '중급': return '★★☆☆☆';
      case '고급': return '★★★☆☆';
      default: return '★☆☆☆☆';
    }
  };

  const hasDetailedInfo = game.category || game.content || game.terms || game.standard || game.type;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300 ease-spring">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{game.icon}</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{game.title}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                  {game.difficulty}
                </Badge>
                <div className="flex items-center space-x-1 text-yellow-500">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-xs font-medium">{getDifficultyStars(game.difficulty)}</span>
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <Badge 
              className={
                game.status === 'playable' 
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-100 text-amber-700 border-amber-200'
              }
            >
              {game.status === 'playable' ? '플레이 가능' : '개발 중'}
            </Badge>
            <div className="flex items-center space-x-2 text-gray-500">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{game.estimatedTime}</span>
            </div>
          </div>

          {/* Description (게임명, 교과명 등 포함)만 남기고, 게임 정보 박스는 완전히 삭제 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm" style={{wordBreak: 'keep-all'}}>
              {game.description}
            </p>
          </div>

          {/* 통계 정보 */}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            닫기
          </Button>
          {game.status === 'playable' && (game.url || onPlay) && (
            <Button 
              onClick={handlePlayGame}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              플레이하기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};