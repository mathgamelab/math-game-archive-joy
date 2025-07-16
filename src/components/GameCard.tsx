import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Eye, Clock, Star } from "lucide-react";

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
  stats?: {
    clickCount: number;
    playCount: number;
  };
}

interface GameCardProps {
  game: GameData;
  onClick: (game: GameData) => void;
  onPlayClick?: (game: GameData) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onClick, onPlayClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'playable': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'development': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '초급': return 'bg-blue-100 text-blue-700 border-blue-200';
      case '중급': return 'bg-purple-100 text-purple-700 border-purple-200';
      case '고급': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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

  return (
    <Card 
      className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg bg-white rounded-2xl overflow-hidden hover:scale-105"
      onClick={() => onClick(game)}
    >
      <div className="relative">
        {/* 게임 아이콘 배경 */}
        <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
          <div className="text-6xl mb-2 group-hover:scale-110 transition-transform duration-300">
            {game.icon}
          </div>
          
          {/* 오버레이 - 호버 시 표시 */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
              <div className="flex items-center justify-center space-x-4 mb-2">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm font-medium">{game.stats?.clickCount || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Play className="h-4 w-4" />
                  <span className="text-sm font-medium">{game.stats?.playCount || 0}</span>
                </div>
              </div>
              {game.status === 'playable' && onPlayClick && (
                <Button
                  size="sm"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayClick(game);
                  }}
                >
                  플레이하기
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 상태 배지 */}
        <div className="absolute top-3 left-3">
          <Badge className={`${getStatusColor(game.status)} text-xs font-medium`}>
            {game.status === 'playable' ? '플레이 가능' : '개발 중'}
          </Badge>
        </div>

        {/* 난이도 배지 */}
        <div className="absolute top-3 right-3">
          <Badge className={`${getDifficultyColor(game.difficulty)} text-xs font-medium`}>
            {game.difficulty}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {game.title}
          </CardTitle>
        </div>
        
        {/* 난이도 별점 */}
        <div className="flex items-center space-x-2">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm text-gray-600 font-medium">
            {getDifficultyStars(game.difficulty)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <CardDescription className="text-gray-600 text-sm line-clamp-3 mb-4">
          {game.summary || game.description.split('\n')[0]}
        </CardDescription>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-500">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{game.estimatedTime}</span>
          </div>

          <div className="flex items-center space-x-2">
            {game.category && (
              <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                {game.category}
              </Badge>
            )}
          </div>
        </div>

        {/* 통계 정보 */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{game.stats?.clickCount || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Play className="h-3 w-3" />
              <span>{game.stats?.playCount || 0}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};