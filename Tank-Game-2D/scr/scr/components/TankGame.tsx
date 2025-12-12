import React, { useState, useCallback } from 'react';
import { GameCanvas } from './GameCanvas';
import { GameUI } from './GameUI';
import { ControlsGuide } from './ControlsGuide';
import { AdminPanel } from './AdminPanel';
import { GAME_CONFIG, AdminCheats } from '@/game/types';
import { MAPS } from '@/game/maps';
import { toast } from 'sonner';

interface TankGameProps {
  mapId?: number;
  roundsToWin?: number;
  isMultiplayer?: boolean;
  onBack?: () => void;
}

export const TankGame: React.FC<TankGameProps> = ({
  mapId = 1,
  roundsToWin = 3,
  isMultiplayer = false,
  onBack,
}) => {
  const [scores, setScores] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [restartKey, setRestartKey] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [roundWins, setRoundWins] = useState([0, 0]);
  const [adminCheats, setAdminCheats] = useState<AdminCheats>({
    enabled: false,
    playerId: 0,
    godMode: false,
    instantKill: false,
    unlimitedBounces: false,
    superSpeed: false,
    rapidFire: false,
  });

  const mapName = MAPS.find(m => m.id === mapId)?.name || 'Classic Arena';

  const handleScoreUpdate = useCallback((newScores: number[]) => {
    setScores(newScores);
  }, []);

  const handleGameOver = useCallback((winningPlayer: number) => {
    setGameOver(true);
    setWinner(winningPlayer);
  }, []);

  const handleRoundWin = useCallback((playerIndex: number) => {
    setRoundWins(prev => {
      const newWins = [...prev];
      newWins[playerIndex]++;
      return newWins;
    });
    setCurrentRound(prev => prev + 1);
    toast.success(`Player ${playerIndex + 1} wins round ${currentRound}!`);
  }, [currentRound]);

  const handlePause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const handleRestart = useCallback(() => {
    setScores([0, 0]);
    setIsPaused(false);
    setGameOver(false);
    setWinner(null);
    setCurrentRound(1);
    setRoundWins([0, 0]);
    setRestartKey(prev => prev + 1);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <header className="text-center mb-6">
        <h1 className="game-title mb-2">Tank Arena</h1>
        <p className="game-subtitle">Best of {roundsToWin} rounds • First to {GAME_CONFIG.winScore} wins each round</p>
      </header>

      <div className="relative">
        <GameUI
          scores={scores}
          isPaused={isPaused}
          onPause={handlePause}
          onResume={handleResume}
          onRestart={handleRestart}
          gameOver={gameOver}
          winner={winner}
          currentRound={currentRound}
          roundWins={roundWins}
          roundsToWin={roundsToWin}
          mapName={mapName}
        />
        
        <GameCanvas
          key={restartKey}
          onScoreUpdate={handleScoreUpdate}
          onGameOver={handleGameOver}
          onRoundWin={handleRoundWin}
          isPaused={isPaused}
          onRestart={handleRestart}
          mapId={mapId}
          roundsToWin={roundsToWin}
          adminCheats={adminCheats}
        />
      </div>

      <div className="flex gap-4 mt-4">
        <ControlsGuide />
        <AdminPanel
          adminCheats={adminCheats}
          onAdminCheatsChange={setAdminCheats}
          playerId={1}
        />
        <AdminPanel
          adminCheats={adminCheats}
          onAdminCheatsChange={setAdminCheats}
          playerId={2}
        />
      </div>
      
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>Collect power-ups • Projectiles bounce off walls • Destroy obstacles to create new paths</p>
      </footer>
    </div>
  );
};
