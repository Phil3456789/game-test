import { 
  Tank, 
  Projectile, 
  Wall, 
  GameState, 
  Vector2D, 
  GAME_CONFIG,
  PLAYER_CONTROLS,
  PowerUp,
  PowerUpType,
  AdminCheats,
} from './types';
import { getMapWalls } from './maps';

let projectileIdCounter = 0;
let powerUpIdCounter = 0;

export const createInitialTanks = (): Tank[] => [
  {
    id: 1,
    position: { x: 100, y: GAME_CONFIG.canvasHeight / 2 },
    rotation: 0,
    turretRotation: 0,
    velocity: { x: 0, y: 0 },
    health: 100,
    maxHealth: 100,
    color: '#22c55e',
    secondaryColor: '#16a34a',
    lastShot: 0,
    isAlive: true,
    respawnTimer: 0,
    activePowerUps: [],
    speedMultiplier: 1,
    fireRateMultiplier: 1,
    damageMultiplier: 1,
    hasShield: false,
  },
  {
    id: 2,
    position: { x: GAME_CONFIG.canvasWidth - 100, y: GAME_CONFIG.canvasHeight / 2 },
    rotation: Math.PI,
    turretRotation: Math.PI,
    velocity: { x: 0, y: 0 },
    health: 100,
    maxHealth: 100,
    color: '#f97316',
    secondaryColor: '#ea580c',
    lastShot: 0,
    isAlive: true,
    respawnTimer: 0,
    activePowerUps: [],
    speedMultiplier: 1,
    fireRateMultiplier: 1,
    damageMultiplier: 1,
    hasShield: false,
  },
];

export const createWalls = (mapId: number = 1): Wall[] => {
  return getMapWalls(mapId);
};

export const createInitialGameState = (mapId: number = 1, roundsToWin: number = 3): GameState => ({
  tanks: createInitialTanks(),
  projectiles: [],
  walls: createWalls(mapId),
  powerUps: [],
  scores: [0, 0],
  isPaused: false,
  gameOver: false,
  winner: null,
  currentRound: 1,
  roundsToWin,
  roundWins: [0, 0],
  currentMap: mapId,
});

export const spawnPowerUp = (walls: Wall[], tanks: Tank[], existingPowerUps: PowerUp[]): PowerUp | null => {
  if (existingPowerUps.length >= GAME_CONFIG.maxPowerUps) return null;
  
  const types: PowerUpType[] = ['shield', 'speed', 'rapid_fire', 'damage_boost', 'teleport'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  // Find valid spawn position
  let position: Vector2D | null = null;
  let attempts = 0;
  const maxAttempts = 50;
  
  while (!position && attempts < maxAttempts) {
    const x = 80 + Math.random() * (GAME_CONFIG.canvasWidth - 160);
    const y = 80 + Math.random() * (GAME_CONFIG.canvasHeight - 160);
    
    // Check wall collision
    let valid = true;
    for (const wall of walls) {
      if (wall.health === 0) continue;
      if (x >= wall.x - 20 && x <= wall.x + wall.width + 20 &&
          y >= wall.y - 20 && y <= wall.y + wall.height + 20) {
        valid = false;
        break;
      }
    }
    
    // Check tank proximity
    for (const tank of tanks) {
      const dx = x - tank.position.x;
      const dy = y - tank.position.y;
      if (Math.sqrt(dx * dx + dy * dy) < 80) {
        valid = false;
        break;
      }
    }
    
    // Check existing power-ups
    for (const powerUp of existingPowerUps) {
      const dx = x - powerUp.position.x;
      const dy = y - powerUp.position.y;
      if (Math.sqrt(dx * dx + dy * dy) < 60) {
        valid = false;
        break;
      }
    }
    
    if (valid) {
      position = { x, y };
    }
    attempts++;
  }
  
  if (!position) return null;
  
  return {
    id: powerUpIdCounter++,
    type,
    position,
    createdAt: Date.now(),
    duration: GAME_CONFIG.powerUpDuration,
  };
};

export const applyPowerUp = (tank: Tank, powerUp: PowerUp): Tank => {
  const now = Date.now();
  const expiresAt = now + GAME_CONFIG.powerUpDuration;
  
  let updatedTank = { ...tank };
  
  switch (powerUp.type) {
    case 'shield':
      updatedTank.hasShield = true;
      updatedTank.activePowerUps = [...tank.activePowerUps, { type: 'shield', expiresAt }];
      break;
    case 'speed':
      updatedTank.speedMultiplier = 2;
      updatedTank.activePowerUps = [...tank.activePowerUps, { type: 'speed', expiresAt }];
      break;
    case 'rapid_fire':
      updatedTank.fireRateMultiplier = 3;
      updatedTank.activePowerUps = [...tank.activePowerUps, { type: 'rapid_fire', expiresAt }];
      break;
    case 'damage_boost':
      updatedTank.damageMultiplier = 2;
      updatedTank.activePowerUps = [...tank.activePowerUps, { type: 'damage_boost', expiresAt }];
      break;
    case 'teleport':
      // Teleport to random valid position
      const newX = 100 + Math.random() * (GAME_CONFIG.canvasWidth - 200);
      const newY = 100 + Math.random() * (GAME_CONFIG.canvasHeight - 200);
      updatedTank.position = { x: newX, y: newY };
      break;
  }
  
  return updatedTank;
};

export const updatePowerUpEffects = (tank: Tank): Tank => {
  const now = Date.now();
  const activePowerUps = tank.activePowerUps.filter(p => p.expiresAt > now);
  
  let speedMultiplier = 1;
  let fireRateMultiplier = 1;
  let damageMultiplier = 1;
  let hasShield = false;
  
  for (const powerUp of activePowerUps) {
    switch (powerUp.type) {
      case 'shield':
        hasShield = true;
        break;
      case 'speed':
        speedMultiplier = 2;
        break;
      case 'rapid_fire':
        fireRateMultiplier = 3;
        break;
      case 'damage_boost':
        damageMultiplier = 2;
        break;
    }
  }
  
  return {
    ...tank,
    activePowerUps,
    speedMultiplier,
    fireRateMultiplier,
    damageMultiplier,
    hasShield,
  };
};

export const handleTankMovement = (
  tank: Tank,
  keysPressed: Set<string>,
  playerIndex: number,
  walls: Wall[],
  otherTank: Tank,
  adminCheats?: AdminCheats
): Tank => {
  if (!tank.isAlive) return tank;
  
  let updatedTank = updatePowerUpEffects(tank);
  
  const controls = playerIndex === 0 ? PLAYER_CONTROLS.player1 : PLAYER_CONTROLS.player2;
  let newRotation = updatedTank.rotation;
  let moveDirection = 0;
  
  if (keysPressed.has(controls.left)) {
    newRotation -= GAME_CONFIG.rotationSpeed;
  }
  if (keysPressed.has(controls.right)) {
    newRotation += GAME_CONFIG.rotationSpeed;
  }
  if (keysPressed.has(controls.up)) {
    moveDirection = 1;
  }
  if (keysPressed.has(controls.down)) {
    moveDirection = -0.6;
  }
  
  const speedMult = adminCheats?.enabled && adminCheats.playerId === tank.id && adminCheats.superSpeed 
    ? 3 
    : updatedTank.speedMultiplier;
  
  const newVelocity = {
    x: Math.cos(newRotation) * GAME_CONFIG.tankSpeed * moveDirection * speedMult,
    y: Math.sin(newRotation) * GAME_CONFIG.tankSpeed * moveDirection * speedMult,
  };
  
  let newPosition = {
    x: updatedTank.position.x + newVelocity.x,
    y: updatedTank.position.y + newVelocity.y,
  };
  
  // Check wall collisions
  const tankRadius = GAME_CONFIG.tankSize / 2;
  for (const wall of walls) {
    if (wall.health === 0) continue;
    
    const closestX = Math.max(wall.x, Math.min(newPosition.x, wall.x + wall.width));
    const closestY = Math.max(wall.y, Math.min(newPosition.y, wall.y + wall.height));
    
    const distX = newPosition.x - closestX;
    const distY = newPosition.y - closestY;
    const distance = Math.sqrt(distX * distX + distY * distY);
    
    if (distance < tankRadius) {
      const overlap = tankRadius - distance;
      const angle = Math.atan2(distY, distX);
      newPosition.x += Math.cos(angle) * overlap;
      newPosition.y += Math.sin(angle) * overlap;
    }
  }
  
  // Check other tank collision
  if (otherTank.isAlive) {
    const dx = newPosition.x - otherTank.position.x;
    const dy = newPosition.y - otherTank.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = GAME_CONFIG.tankSize;
    
    if (distance < minDistance) {
      const overlap = minDistance - distance;
      const angle = Math.atan2(dy, dx);
      newPosition.x += Math.cos(angle) * overlap * 0.5;
      newPosition.y += Math.sin(angle) * overlap * 0.5;
    }
  }
  
  return {
    ...updatedTank,
    position: newPosition,
    rotation: newRotation,
    turretRotation: newRotation,
    velocity: newVelocity,
  };
};

export const shootProjectile = (tank: Tank, now: number, adminCheats?: AdminCheats): Projectile | null => {
  if (!tank.isAlive) return null;
  
  const fireRateMult = adminCheats?.enabled && adminCheats.playerId === tank.id && adminCheats.rapidFire
    ? 10
    : tank.fireRateMultiplier;
  
  const cooldown = GAME_CONFIG.shootCooldown / fireRateMult;
  if (now - tank.lastShot < cooldown) return null;
  
  const barrelLength = GAME_CONFIG.tankSize * 0.8;
  
  const unlimitedBounces = adminCheats?.enabled && adminCheats.playerId === tank.id && adminCheats.unlimitedBounces;
  const instantKill = adminCheats?.enabled && adminCheats.playerId === tank.id && adminCheats.instantKill;
  
  const projectile: Projectile = {
    id: projectileIdCounter++,
    position: {
      x: tank.position.x + Math.cos(tank.turretRotation) * barrelLength,
      y: tank.position.y + Math.sin(tank.turretRotation) * barrelLength,
    },
    velocity: {
      x: Math.cos(tank.turretRotation) * GAME_CONFIG.projectileSpeed,
      y: Math.sin(tank.turretRotation) * GAME_CONFIG.projectileSpeed,
    },
    ownerId: tank.id,
    bounces: 0,
    maxBounces: unlimitedBounces ? 999 : GAME_CONFIG.maxBounces,
    createdAt: now,
    damage: instantKill ? 1000 : (tank.damageMultiplier * 100),
  };
  
  return projectile;
};

export const updateProjectile = (
  projectile: Projectile,
  walls: Wall[],
  now: number
): { projectile: Projectile | null; wallHit: Wall | null } => {
  if (now - projectile.createdAt > GAME_CONFIG.projectileLifetime) {
    return { projectile: null, wallHit: null };
  }
  
  let newPosition = {
    x: projectile.position.x + projectile.velocity.x,
    y: projectile.position.y + projectile.velocity.y,
  };
  
  let newVelocity = { ...projectile.velocity };
  let bounces = projectile.bounces;
  let wallHit: Wall | null = null;
  
  for (const wall of walls) {
    if (wall.health === 0) continue;
    
    if (
      newPosition.x >= wall.x &&
      newPosition.x <= wall.x + wall.width &&
      newPosition.y >= wall.y &&
      newPosition.y <= wall.y + wall.height
    ) {
      // Determine which side was hit
      const prevX = projectile.position.x;
      const prevY = projectile.position.y;
      
      const hitLeft = prevX < wall.x && newPosition.x >= wall.x;
      const hitRight = prevX > wall.x + wall.width && newPosition.x <= wall.x + wall.width;
      const hitTop = prevY < wall.y && newPosition.y >= wall.y;
      const hitBottom = prevY > wall.y + wall.height && newPosition.y <= wall.y + wall.height;
      
      if (hitLeft || hitRight) {
        newVelocity.x = -newVelocity.x;
        newPosition.x = hitLeft ? wall.x - 1 : wall.x + wall.width + 1;
      }
      if (hitTop || hitBottom) {
        newVelocity.y = -newVelocity.y;
        newPosition.y = hitTop ? wall.y - 1 : wall.y + wall.height + 1;
      }
      
      bounces++;
      wallHit = wall;
      
      if (bounces > projectile.maxBounces) {
        return { projectile: null, wallHit };
      }
      
      break;
    }
  }
  
  return {
    projectile: {
      ...projectile,
      position: newPosition,
      velocity: newVelocity,
      bounces,
    },
    wallHit,
  };
};

export const checkProjectileTankCollision = (
  projectile: Projectile,
  tank: Tank
): boolean => {
  if (!tank.isAlive) return false;
  if (projectile.ownerId === tank.id && projectile.bounces === 0) return false;
  
  const dx = projectile.position.x - tank.position.x;
  const dy = projectile.position.y - tank.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  return distance < GAME_CONFIG.tankSize / 2 + GAME_CONFIG.projectileSize;
};

export const checkPowerUpCollision = (tank: Tank, powerUp: PowerUp): boolean => {
  if (!tank.isAlive) return false;
  
  const dx = tank.position.x - powerUp.position.x;
  const dy = tank.position.y - powerUp.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  return distance < GAME_CONFIG.tankSize / 2 + 15;
};

export const respawnTank = (tank: Tank, playerIndex: number): Tank => {
  const spawnX = playerIndex === 0 ? 100 : GAME_CONFIG.canvasWidth - 100;
  const spawnRotation = playerIndex === 0 ? 0 : Math.PI;
  
  return {
    ...tank,
    position: { x: spawnX, y: GAME_CONFIG.canvasHeight / 2 },
    rotation: spawnRotation,
    turretRotation: spawnRotation,
    velocity: { x: 0, y: 0 },
    health: tank.maxHealth,
    isAlive: true,
    respawnTimer: 0,
    activePowerUps: [],
    speedMultiplier: 1,
    fireRateMultiplier: 1,
    damageMultiplier: 1,
    hasShield: false,
  };
};

export const resetRound = (state: GameState, nextMap?: number): GameState => {
  const mapId = nextMap ?? state.currentMap;
  return {
    ...state,
    tanks: createInitialTanks(),
    projectiles: [],
    walls: createWalls(mapId),
    powerUps: [],
    scores: [0, 0],
    currentMap: mapId,
    currentRound: state.currentRound + 1,
  };
};
