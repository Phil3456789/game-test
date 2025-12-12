import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { MAPS } from '@/game/maps';
import { Users, Globe, ArrowLeft, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MultiplayerLobbyProps {
  onStartGame: (isMultiplayer: boolean, isHost: boolean, roomId?: string, mapId?: number, roundsToWin?: number) => void;
  onBack: () => void;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  onStartGame,
  onBack,
}) => {
  const {
    playerId,
    room,
    isHost,
    isConnected,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    findQuickMatch,
    cancelQuickMatch,
    startGame,
  } = useMultiplayer();

  const [roomCode, setRoomCode] = useState('');
  const [selectedMap, setSelectedMap] = useState('1');
  const [roundsToWin, setRoundsToWin] = useState('3');
  const [adminPassword, setAdminPassword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    const code = await createRoom(
      parseInt(roundsToWin),
      parseInt(selectedMap),
      adminPassword || undefined
    );
    setIsCreating(false);
    if (code) {
      toast.success(`Room created! Code: ${code}`);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      toast.error('Please enter a room code');
      return;
    }
    setIsJoining(true);
    const success = await joinRoom(roomCode);
    setIsJoining(false);
    if (success) {
      toast.success('Joined room!');
    }
  };

  const handleQuickMatch = async () => {
    setIsSearching(true);
    await findQuickMatch();
  };

  const handleCancelQuickMatch = () => {
    setIsSearching(false);
    cancelQuickMatch();
  };

  const copyRoomCode = () => {
    if (room?.room_code) {
      navigator.clipboard.writeText(room.room_code);
      toast.success('Room code copied!');
    }
  };

  const handleStartGame = async () => {
    if (room && isHost && room.guest_id) {
      await startGame();
      onStartGame(true, true, room.id, room.current_map, room.rounds_to_win);
    }
  };

  // If in a room, show the waiting room UI
  if (isConnected && room) {
    return (
      <div className="game-panel p-6 space-y-6 w-full max-w-md">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary">Game Room</h2>
          <Button variant="ghost" size="sm" onClick={leaveRoom}>
            Leave
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Room Code</p>
              <p className="text-2xl font-mono font-bold tracking-widest">{room.room_code}</p>
            </div>
            <Button variant="outline" size="icon" onClick={copyRoomCode}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Players</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-card rounded">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="text-primary">Player 1 (Host)</span>
                {isHost && <span className="text-xs text-muted-foreground">(You)</span>}
              </div>
              <div className="flex items-center gap-2 p-2 bg-card rounded">
                {room.guest_id ? (
                  <>
                    <div className="w-3 h-3 rounded-full bg-secondary animate-pulse" />
                    <span className="text-secondary">Player 2</span>
                    {!isHost && <span className="text-xs text-muted-foreground">(You)</span>}
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                    <span className="text-muted-foreground">Waiting for player...</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Map</p>
              <p className="font-medium">{MAPS.find(m => m.id === room.current_map)?.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Rounds to Win</p>
              <p className="font-medium">{room.rounds_to_win}</p>
            </div>
          </div>

          {isHost ? (
            <Button
              onClick={handleStartGame}
              disabled={!room.guest_id}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {room.guest_id ? 'Start Game' : 'Waiting for opponent...'}
            </Button>
          ) : (
            <div className="text-center p-4 bg-muted rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Waiting for host to start...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main lobby UI
  return (
    <div className="game-panel p-6 space-y-6 w-full max-w-md">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold text-primary">Online Multiplayer</h2>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>
      )}

      {isSearching ? (
        <div className="text-center space-y-4 py-8">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-lg">Finding opponent...</p>
          <Button variant="outline" onClick={handleCancelQuickMatch}>
            Cancel
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="join">Join</TabsTrigger>
            <TabsTrigger value="quick">Quick</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Map</Label>
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
                  <SelectItem value="1">1 Round</SelectItem>
                  <SelectItem value="2">2 Rounds</SelectItem>
                  <SelectItem value="3">3 Rounds</SelectItem>
                  <SelectItem value="5">5 Rounds</SelectItem>
                  <SelectItem value="7">7 Rounds</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Admin Password (Optional)</Label>
              <Input
                type="password"
                placeholder="Leave empty for no admin"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
            </div>

            <Button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Users className="h-4 w-4 mr-2" />
              )}
              Create Room
            </Button>
          </TabsContent>

          <TabsContent value="join" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Room Code</Label>
              <Input
                placeholder="Enter room code..."
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-xl font-mono tracking-widest uppercase"
              />
            </div>

            <Button
              onClick={handleJoinRoom}
              disabled={isJoining || !roomCode.trim()}
              className="w-full bg-secondary hover:bg-secondary/90"
            >
              {isJoining ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Users className="h-4 w-4 mr-2" />
              )}
              Join Room
            </Button>
          </TabsContent>

          <TabsContent value="quick" className="space-y-4 mt-4">
            <div className="text-center py-4">
              <Globe className="h-12 w-12 mx-auto mb-4 text-accent" />
              <p className="text-muted-foreground mb-4">
                Instantly match with a random opponent online
              </p>
            </div>

            <Button
              onClick={handleQuickMatch}
              className="w-full bg-accent hover:bg-accent/90"
            >
              <Globe className="h-4 w-4 mr-2" />
              Find Match
            </Button>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
