import React from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Play, RotateCcw } from 'lucide-react';

interface GameUIProps {
  scores: number[];
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  gameOver: boolean;
  winner: number | null;
  currentRound?: number;
  roundWins?: number[];
  roundsToWin?: number;
  mapName?: string;
}

export const GameUI: React.FC<GameUIProps> = ({
  scores,
  isPaused,
  onPause,
  onResume,
  onRestart,
  gameOver,
  winner,
  currentRound = 1,
  roundWins = [0, 0],
  roundsToWin = 3,
  mapName,
}) => {
  return (
    <div className="w-full max-w-[1000px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="game-panel flex items-center gap-4 min-w-[200px]">
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Player 1</span>
            <span className="score-display player1-color">{scores[0]}</span>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: roundsToWin }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < roundWins[0] ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-2">
            {!gameOver && (
              <Button
                variant="outline"
                size="icon"
                onClick={isPaused ? onResume : onPause}
                className="border-border hover:bg-muted"
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={onRestart}
              className="border-border hover:bg-muted"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          {mapName && (
            <span className="text-xs text-muted-foreground">{mapName}</span>
          )}
          <span className="text-xs text-muted-foreground">Round {currentRound}</span>
        </div>
        
        <div className="game-panel flex items-center gap-4 min-w-[200px] justify-end">
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Player 2</span>
            <span className="score-display player2-color">{scores[1]}</span>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: roundsToWin }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < roundWins[1] ? 'bg-secondary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Overlay */}
      {gameOver && winner && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10 rounded-lg">
          <div className="game-panel text-center p-8 animate-tank-spawn">
            <h2 className="game-title mb-4">
              <span className={winner === 1 ? 'player1-color' : 'player2-color'}>
                Player {winner}
              </span>
            </h2>
            <p className="game-subtitle mb-2">Wins the Match!</p>
            <p className="text-muted-foreground mb-6">
              {roundWins[winner - 1]} - {roundWins[winner === 1 ? 1 : 0]} rounds
            </p>
            <Button
              onClick={onRestart}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-display tracking-wider"
            >
              Play Again
            </Button>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && !gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10 rounded-lg">
          <div className="game-panel text-center p-8">
            <h2 className="game-title mb-4">Paused</h2>
            <Button
              onClick={onResume}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-display tracking-wider"
            >
              Resume
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
