import React, { useState } from 'react';
import { MainMenu } from '@/components/MainMenu';
import { TankGame } from '@/components/TankGame';
import { MultiplayerLobby } from '@/components/MultiplayerLobby';

type GameMode = 'menu' | 'local' | 'multiplayer-lobby' | 'multiplayer-game';

const Index: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [gameSettings, setGameSettings] = useState({
    mapId: 1,
    roundsToWin: 3,
    isHost: false,
    roomId: '',
  });

  const handleStartLocal = (mapId: number, roundsToWin: number) => {
    setGameSettings({ ...gameSettings, mapId, roundsToWin });
    setGameMode('local');
  };

  const handleStartMultiplayer = () => {
    setGameMode('multiplayer-lobby');
  };

  const handleMultiplayerGameStart = (
    isMultiplayer: boolean,
    isHost: boolean,
    roomId?: string,
    mapId?: number,
    roundsToWin?: number
  ) => {
    setGameSettings({
      mapId: mapId || 1,
      roundsToWin: roundsToWin || 3,
      isHost,
      roomId: roomId || '',
    });
    setGameMode('multiplayer-game');
  };

  const handleBack = () => {
    setGameMode('menu');
  };

  if (gameMode === 'menu') {
    return (
      <MainMenu
        onStartLocal={handleStartLocal}
        onStartMultiplayer={handleStartMultiplayer}
      />
    );
  }

  if (gameMode === 'multiplayer-lobby') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <MultiplayerLobby
          onStartGame={handleMultiplayerGameStart}
          onBack={handleBack}
        />
      </div>
    );
  }

  if (gameMode === 'local' || gameMode === 'multiplayer-game') {
    return (
      <TankGame
        mapId={gameSettings.mapId}
        roundsToWin={gameSettings.roundsToWin}
        isMultiplayer={gameMode === 'multiplayer-game'}
        onBack={handleBack}
      />
    );
  }

  return null;
};

export default Index;
