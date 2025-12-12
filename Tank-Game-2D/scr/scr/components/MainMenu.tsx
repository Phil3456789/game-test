import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MAPS } from '@/game/maps';
import { Users, Globe, Gamepad2, Settings } from 'lucide-react';

interface MainMenuProps {
  onStartLocal: (mapId: number, roundsToWin: number) => void;
  onStartMultiplayer: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartLocal,
  onStartMultiplayer,
}) => {
  const [selectedMap, setSelectedMap] = useState('1');
  const [roundsToWin, setRoundsToWin] = useState('3');
  const [showSettings, setShowSettings] = useState(false);

  const handleStartLocal = () => {
    onStartLocal(parseInt(selectedMap), parseInt(roundsToWin));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="game-title text-6xl md:text-8xl mb-4">Tank Arena</h1>
        <p className="game-subtitle text-xl md:text-2xl">Battle for Glory</p>
      </div>

      <div className="game-panel p-8 w-full max-w-md space-y-6">
        {showSettings ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Game Settings</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                Back
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Map</Label>
                <Select value={selectedMap} onValueChange={setSelectedMap}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MAPS.map(map => (
                      <SelectItem key={map.id} value={String(map.id)}>
                        {map.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Rounds to Win</Label>
                <Select value={roundsToWin} onValueChange={setRoundsToWin}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Round (Quick)</SelectItem>
                    <SelectItem value="2">Best of 3</SelectItem>
                    <SelectItem value="3">Best of 5</SelectItem>
                    <SelectItem value="5">Best of 9</SelectItem>
                    <SelectItem value="7">Best of 13</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleStartLocal}
                className="w-full bg-primary hover:bg-primary/90 h-14 text-lg"
              >
                <Gamepad2 className="h-5 w-5 mr-2" />
                Start Local Game
              </Button>
            </div>
          </>
        ) : (
          <>
            <Button
              onClick={() => setShowSettings(true)}
              className="w-full bg-primary hover:bg-primary/90 h-16 text-xl"
            >
              <Users className="h-6 w-6 mr-3" />
              Local Multiplayer
            </Button>

            <Button
              onClick={onStartMultiplayer}
              className="w-full bg-secondary hover:bg-secondary/90 h-16 text-xl"
            >
              <Globe className="h-6 w-6 mr-3" />
              Online Multiplayer
            </Button>

            <div className="pt-4 border-t border-border">
              <p className="text-center text-sm text-muted-foreground">
                Power-ups • Multiple Maps • Admin Cheats
              </p>
            </div>
          </>
        )}
      </div>

      <div className="mt-12 text-center text-sm text-muted-foreground max-w-lg">
        <p className="mb-2">
          <span className="text-primary font-bold">Player 1:</span> WASD + Space
          <span className="mx-4">|</span>
          <span className="text-secondary font-bold">Player 2:</span> Arrows + Enter
        </p>
        <p>Collect power-ups, destroy obstacles, and dominate the arena!</p>
      </div>
    </div>
  );
};
