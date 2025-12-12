-- Create enum for game status
CREATE TYPE public.game_status AS ENUM ('waiting', 'playing', 'finished');

-- Create enum for power-up types
CREATE TYPE public.power_up_type AS ENUM ('shield', 'speed', 'rapid_fire', 'damage_boost', 'teleport');

-- Game rooms table
CREATE TABLE public.game_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  host_id TEXT NOT NULL,
  guest_id TEXT,
  status game_status NOT NULL DEFAULT 'waiting',
  current_map INTEGER NOT NULL DEFAULT 1,
  rounds_to_win INTEGER NOT NULL DEFAULT 3,
  current_round INTEGER NOT NULL DEFAULT 1,
  host_score INTEGER NOT NULL DEFAULT 0,
  guest_score INTEGER NOT NULL DEFAULT 0,
  admin_password TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Game state table for real-time sync
CREATE TABLE public.game_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  host_tank JSONB NOT NULL DEFAULT '{}',
  guest_tank JSONB NOT NULL DEFAULT '{}',
  projectiles JSONB NOT NULL DEFAULT '[]',
  power_ups JSONB NOT NULL DEFAULT '[]',
  walls JSONB NOT NULL DEFAULT '[]',
  is_paused BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quick match queue
CREATE TABLE public.quick_match_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_match_queue ENABLE ROW LEVEL SECURITY;

-- Public policies for game rooms (anyone can read/write for now)
CREATE POLICY "Anyone can view game rooms" ON public.game_rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can create game rooms" ON public.game_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update game rooms" ON public.game_rooms FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete game rooms" ON public.game_rooms FOR DELETE USING (true);

-- Public policies for game states
CREATE POLICY "Anyone can view game states" ON public.game_states FOR SELECT USING (true);
CREATE POLICY "Anyone can create game states" ON public.game_states FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update game states" ON public.game_states FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete game states" ON public.game_states FOR DELETE USING (true);

-- Public policies for quick match queue
CREATE POLICY "Anyone can view queue" ON public.quick_match_queue FOR SELECT USING (true);
CREATE POLICY "Anyone can join queue" ON public.quick_match_queue FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can leave queue" ON public.quick_match_queue FOR DELETE USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_states;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quick_match_queue;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_game_rooms_updated_at
BEFORE UPDATE ON public.game_rooms
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_game_states_updated_at
BEFORE UPDATE ON public.game_states
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();