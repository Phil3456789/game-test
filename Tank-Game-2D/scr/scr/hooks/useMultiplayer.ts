import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GameState, Tank, Projectile, PowerUp, Wall } from '@/game/types';

export interface GameRoom {
  id: string;
  room_code: string;
  host_id: string;
  guest_id: string | null;
  status: 'waiting' | 'playing' | 'finished';
  current_map: number;
  rounds_to_win: number;
  current_round: number;
  host_score: number;
  guest_score: number;
  admin_password: string | null;
}

interface UseMultiplayerResult {
  playerId: string;
  room: GameRoom | null;
  isHost: boolean;
  isConnected: boolean;
  error: string | null;
  createRoom: (roundsToWin: number, mapId: number, adminPassword?: string) => Promise<string | null>;
  joinRoom: (roomCode: string) => Promise<boolean>;
  leaveRoom: () => Promise<void>;
  findQuickMatch: () => Promise<void>;
  cancelQuickMatch: () => void;
  startGame: () => Promise<void>;
  updateGameState: (state: Partial<GameState>) => Promise<void>;
  syncTankState: (tank: Tank) => Promise<void>;
  remoteGameState: Partial<GameState> | null;
  remoteTank: Tank | null;
}

export const useMultiplayer = (): UseMultiplayerResult => {
  const [playerId] = useState(() => `player_${Math.random().toString(36).substring(2, 9)}`);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remoteGameState, setRemoteGameState] = useState<Partial<GameState> | null>(null);
  const [remoteTank, setRemoteTank] = useState<Tank | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const quickMatchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isHost = room?.host_id === playerId;

  // Generate room code
  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Create room
  const createRoom = useCallback(async (roundsToWin: number, mapId: number, adminPassword?: string): Promise<string | null> => {
    try {
      const roomCode = generateRoomCode();
      
      const { data, error: insertError } = await supabase
        .from('game_rooms')
        .insert({
          room_code: roomCode,
          host_id: playerId,
          rounds_to_win: roundsToWin,
          current_map: mapId,
          admin_password: adminPassword || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Create initial game state
      await supabase
        .from('game_states')
        .insert({
          room_id: data.id,
          host_tank: {},
          guest_tank: {},
          projectiles: [],
          power_ups: [],
          walls: [],
        });

      setRoom(data as GameRoom);
      setIsConnected(true);
      return roomCode;
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room');
      return null;
    }
  }, [playerId]);

  // Join room
  const joinRoom = useCallback(async (roomCode: string): Promise<boolean> => {
    try {
      const { data: existingRoom, error: findError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .eq('status', 'waiting')
        .maybeSingle();

      if (findError) throw findError;
      if (!existingRoom) {
        setError('Room not found or already in progress');
        return false;
      }
      if (existingRoom.guest_id) {
        setError('Room is full');
        return false;
      }

      const { data, error: updateError } = await supabase
        .from('game_rooms')
        .update({ guest_id: playerId })
        .eq('id', existingRoom.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setRoom(data as GameRoom);
      setIsConnected(true);
      return true;
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room');
      return false;
    }
  }, [playerId]);

  // Leave room
  const leaveRoom = useCallback(async () => {
    if (!room) return;

    try {
      if (isHost) {
        await supabase.from('game_rooms').delete().eq('id', room.id);
      } else {
        await supabase
          .from('game_rooms')
          .update({ guest_id: null })
          .eq('id', room.id);
      }
    } catch (err) {
      console.error('Error leaving room:', err);
    }

    setRoom(null);
    setIsConnected(false);
  }, [room, isHost]);

  // Quick match
  const findQuickMatch = useCallback(async () => {
    setIsSearching(true);
    
    try {
      // Check for existing waiting players
      const { data: waitingPlayers } = await supabase
        .from('quick_match_queue')
        .select('*')
        .neq('player_id', playerId)
        .order('created_at', { ascending: true })
        .limit(1);

      if (waitingPlayers && waitingPlayers.length > 0) {
        // Found a match, create room
        const roomCode = await createRoom(3, 1);
        if (roomCode) {
          // Notify the other player (they'll pick it up through realtime)
          await supabase.from('quick_match_queue').delete().eq('player_id', waitingPlayers[0].player_id);
        }
      } else {
        // Add to queue
        await supabase.from('quick_match_queue').upsert({
          player_id: playerId,
        });

        // Poll for match
        quickMatchIntervalRef.current = setInterval(async () => {
          const { data: rooms } = await supabase
            .from('game_rooms')
            .select('*')
            .eq('status', 'waiting')
            .is('guest_id', null)
            .order('created_at', { ascending: false })
            .limit(1);

          if (rooms && rooms.length > 0 && rooms[0].host_id !== playerId) {
            cancelQuickMatch();
            await joinRoom(rooms[0].room_code);
          }
        }, 2000);
      }
    } catch (err) {
      console.error('Error finding quick match:', err);
      setError('Failed to find match');
      setIsSearching(false);
    }
  }, [playerId, createRoom, joinRoom]);

  const cancelQuickMatch = useCallback(() => {
    setIsSearching(false);
    if (quickMatchIntervalRef.current) {
      clearInterval(quickMatchIntervalRef.current);
      quickMatchIntervalRef.current = null;
    }
    supabase.from('quick_match_queue').delete().eq('player_id', playerId);
  }, [playerId]);

  // Start game
  const startGame = useCallback(async () => {
    if (!room || !isHost) return;

    await supabase
      .from('game_rooms')
      .update({ status: 'playing' })
      .eq('id', room.id);
  }, [room, isHost]);

  // Update game state
  const updateGameState = useCallback(async (state: Partial<GameState>) => {
    if (!room) return;

    const { data: gameState } = await supabase
      .from('game_states')
      .select('*')
      .eq('room_id', room.id)
      .maybeSingle();

    if (gameState) {
      await supabase
        .from('game_states')
        .update({
          projectiles: state.projectiles ? JSON.parse(JSON.stringify(state.projectiles)) : gameState.projectiles,
          power_ups: state.powerUps ? JSON.parse(JSON.stringify(state.powerUps)) : gameState.power_ups,
          walls: state.walls ? JSON.parse(JSON.stringify(state.walls)) : gameState.walls,
          is_paused: state.isPaused ?? gameState.is_paused,
        })
        .eq('id', gameState.id);
    }
  }, [room]);

  // Sync tank state
  const syncTankState = useCallback(async (tank: Tank) => {
    if (!room) return;

    const { data: gameState } = await supabase
      .from('game_states')
      .select('*')
      .eq('room_id', room.id)
      .maybeSingle();

    if (gameState) {
      const tankData = JSON.parse(JSON.stringify(tank));
      await supabase
        .from('game_states')
        .update({
          [isHost ? 'host_tank' : 'guest_tank']: tankData,
        })
        .eq('id', gameState.id);
    }
  }, [room, isHost]);

  // Subscribe to room changes
  useEffect(() => {
    if (!room) return;

    const roomChannel = supabase
      .channel(`room-${room.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_rooms',
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setRoom(null);
            setIsConnected(false);
          } else if (payload.eventType === 'UPDATE') {
            setRoom(payload.new as GameRoom);
          }
        }
      )
      .subscribe();

    const stateChannel = supabase
      .channel(`state-${room.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_states',
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const data = payload.new as {
              host_tank: unknown;
              guest_tank: unknown;
              projectiles: unknown;
              power_ups: unknown;
              walls: unknown;
              is_paused: boolean;
            };
            
            // Get remote player's tank
            const remoteTankData = isHost ? data.guest_tank : data.host_tank;
            if (remoteTankData && typeof remoteTankData === 'object' && Object.keys(remoteTankData).length > 0) {
              setRemoteTank(remoteTankData as Tank);
            }

            setRemoteGameState({
              projectiles: data.projectiles as Projectile[],
              powerUps: data.power_ups as PowerUp[],
              walls: data.walls as Wall[],
              isPaused: data.is_paused,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(stateChannel);
    };
  }, [room, isHost]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (quickMatchIntervalRef.current) {
        clearInterval(quickMatchIntervalRef.current);
      }
    };
  }, []);

  return {
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
    updateGameState,
    syncTankState,
    remoteGameState,
    remoteTank,
  };
};
