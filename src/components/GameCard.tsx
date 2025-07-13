import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface GameData {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'development' | 'playable';
  difficulty: string;
  estimatedTime: string;
  category?: string;
  content?: string;
  terms?: string;
  standard?: string;
  type?: string;
  url?: string;
}

interface GameCardProps {
  game: GameData;
  onClick: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => {
  return (
    <Card 
      className="group relative h-full cursor-pointer bg-gradient-card border-border transition-smooth hover:shadow-card-hover hover:-translate-y-1"
      onClick={onClick}
    >
      <CardContent className="p-6 h-full flex flex-col">
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
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
        </div>

        {/* Game Icon */}
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
          {game.icon}
        </div>

        {/* Game Content */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
            {game.title}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4 flex-1 leading-relaxed">
            {game.description}
          </p>

          {/* Footer Tags */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
            <Badge variant="outline" className="text-xs">
              {game.difficulty}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {game.estimatedTime}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};