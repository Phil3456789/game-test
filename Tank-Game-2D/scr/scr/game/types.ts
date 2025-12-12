export interface Vector2D {
  x: number;
  y: number;
}

export interface PowerUp {
  id: number;
  type: PowerUpType;
  position: Vector2D;
  createdAt: number;
  duration: number;
}

export type PowerUpType = 'shield' | 'speed' | 'rapid_fire' | 'damage_boost' | 'teleport';

export interface ActivePowerUp {
  type: PowerUpType;
  expiresAt: number;
}

export interface Tank {
  id: number;
  position: Vector2D;
  rotation: number;
  turretRotation: number;
  velocity: Vector2D;
  health: number;
  maxHealth: number;
  color: string;
  secondaryColor: string;
  lastShot: number;
  isAlive: boolean;
  respawnTimer: number;
  activePowerUps: ActivePowerUp[];
  speedMultiplier: number;
  fireRateMultiplier: number;
  damageMultiplier: number;
  hasShield: boolean;
}

export interface Projectile {
  id: number;
  position: Vector2D;
  velocity: Vector2D;
  ownerId: number;
  bounces: number;
  maxBounces: number;
  createdAt: number;
  damage: number;
}

export interface Wall {
  x: number;
  y: number;
  width: number;
  height: number;
  destructible: boolean;
  health: number;
}

export interface GameState {
  tanks: Tank[];
  projectiles: Projectile[];
  walls: Wall[];
  powerUps: PowerUp[];
  scores: number[];
  isPaused: boolean;
  gameOver: boolean;
  winner: number | null;
  currentRound: number;
  roundsToWin: number;
  roundWins: number[];
  currentMap: number;
}

export interface Controls {
  up: string;
  down: string;
  left: string;
  right: string;
  shoot: string;
}

export interface PlayerControls {
  player1: Controls;
  player2: Controls;
}

export const PLAYER_CONTROLS: PlayerControls = {
  player1: {
    up: 'w',
    down: 's',
    left: 'a',
    right: 'd',
    shoot: ' ',
  },
  player2: {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    shoot: 'Enter',
  },
};

export interface MapConfig {
  id: number;
  name: string;
  walls: Wall[];
}

export const GAME_CONFIG = {
  canvasWidth: 1000,
  canvasHeight: 600,
  tankSize: 30,
  tankSpeed: 3,
  rotationSpeed: 0.05,
  projectileSpeed: 8,
  projectileSize: 5,
  shootCooldown: 500,
  maxBounces: 3,
  projectileLifetime: 5000,
  respawnTime: 2000,
  winScore: 5,
  wallThickness: 20,
  powerUpSpawnInterval: 5000,
  powerUpDuration: 8000,
  maxPowerUps: 3,
};

export const POWER_UP_CONFIG: Record<PowerUpType, { color: string; icon: string; description: string }> = {
  shield: { color: '#3b82f6', icon: '🛡️', description: 'Blocks one hit' },
  speed: { color: '#eab308', icon: '⚡', description: '2x movement speed' },
  rapid_fire: { color: '#ef4444', icon: '🔥', description: '3x fire rate' },
  damage_boost: { color: '#a855f7', icon: '💥', description: '2x damage' },
  teleport: { color: '#06b6d4', icon: '✨', description: 'Random teleport' },
};

export interface AdminCheats {
  enabled: boolean;
  playerId: number;
  godMode: boolean;
  instantKill: boolean;
  unlimitedBounces: boolean;
  superSpeed: boolean;
  rapidFire: boolean;
}

// Admin password - stored here for now (in a real app, this would be server-side)
export const ADMIN_PASSWORD = 'tank2026Philadmin';
