import { Tank, Projectile, Wall, GameState, GAME_CONFIG, PowerUp, POWER_UP_CONFIG } from './types';

export const drawGrid = (ctx: CanvasRenderingContext2D) => {
  const { canvasWidth, canvasHeight } = GAME_CONFIG;
  const gridSize = 40;
  
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
  ctx.lineWidth = 1;
  
  for (let x = 0; x <= canvasWidth; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
  }
  
  for (let y = 0; y <= canvasHeight; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();
  }
};

export const drawWall = (ctx: CanvasRenderingContext2D, wall: Wall) => {
  if (wall.health === 0) return;
  
  const gradient = ctx.createLinearGradient(wall.x, wall.y, wall.x, wall.y + wall.height);
  
  if (wall.destructible) {
    const alpha = wall.health / 3;
    gradient.addColorStop(0, `rgba(71, 85, 105, ${0.6 + alpha * 0.2})`);
    gradient.addColorStop(1, `rgba(51, 65, 85, ${0.6 + alpha * 0.2})`);
  } else {
    gradient.addColorStop(0, 'rgba(100, 116, 139, 0.9)');
    gradient.addColorStop(1, 'rgba(71, 85, 105, 0.9)');
  }
  
  ctx.fillStyle = gradient;
  ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
  
  // Border
  ctx.strokeStyle = wall.destructible ? 'rgba(148, 163, 184, 0.4)' : 'rgba(148, 163, 184, 0.6)';
  ctx.lineWidth = 2;
  ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
  
  // Inner highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.strokeRect(wall.x + 2, wall.y + 2, wall.width - 4, wall.height - 4);
};

export const drawPowerUp = (ctx: CanvasRenderingContext2D, powerUp: PowerUp) => {
  const { position, type } = powerUp;
  const config = POWER_UP_CONFIG[type];
  const size = 20;
  const pulse = 1 + Math.sin(Date.now() / 200) * 0.15;
  
  ctx.save();
  ctx.translate(position.x, position.y);
  ctx.scale(pulse, pulse);
  
  // Glow
  ctx.shadowColor = config.color;
  ctx.shadowBlur = 20;
  
  // Background circle
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
  gradient.addColorStop(0, config.color);
  gradient.addColorStop(1, `${config.color}88`);
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner circle
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
  ctx.fill();
  
  // Icon
  ctx.shadowBlur = 0;
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(config.icon, 0, 0);
  
  ctx.restore();
};

export const drawTank = (ctx: CanvasRenderingContext2D, tank: Tank) => {
  if (!tank.isAlive) return;
  
  const { position, rotation, turretRotation, color, secondaryColor, hasShield, activePowerUps } = tank;
  const size = GAME_CONFIG.tankSize;
  
  ctx.save();
  ctx.translate(position.x, position.y);
  
  // Shield effect
  if (hasShield) {
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 25;
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.3;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  
  // Power-up auras
  if (activePowerUps.some(p => p.type === 'speed')) {
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 15;
  } else if (activePowerUps.some(p => p.type === 'rapid_fire')) {
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 15;
  } else if (activePowerUps.some(p => p.type === 'damage_boost')) {
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 15;
  } else {
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
  }
  
  // Tank body
  ctx.rotate(rotation);
  
  // Tracks
  ctx.fillStyle = 'rgba(30, 30, 30, 0.9)';
  ctx.fillRect(-size / 2, -size / 2 - 3, size, 8);
  ctx.fillRect(-size / 2, size / 2 - 5, size, 8);
  
  // Main body
  const bodyGradient = ctx.createLinearGradient(-size / 2, 0, size / 2, 0);
  bodyGradient.addColorStop(0, secondaryColor);
  bodyGradient.addColorStop(0.5, color);
  bodyGradient.addColorStop(1, secondaryColor);
  
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.roundRect(-size / 2, -size / 3, size, size / 1.5, 4);
  ctx.fill();
  
  // Body details
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(-size / 2 + 4, -size / 3 + 4, size - 8, size / 1.5 - 8);
  
  ctx.rotate(-rotation);
  
  // Turret
  ctx.rotate(turretRotation);
  
  // Turret base
  ctx.fillStyle = secondaryColor;
  ctx.beginPath();
  ctx.arc(0, 0, size / 4, 0, Math.PI * 2);
  ctx.fill();
  
  // Barrel
  const barrelGradient = ctx.createLinearGradient(0, -4, size * 0.8, -4);
  barrelGradient.addColorStop(0, color);
  barrelGradient.addColorStop(1, secondaryColor);
  
  ctx.fillStyle = barrelGradient;
  ctx.fillRect(0, -4, size * 0.8, 8);
  
  // Barrel tip
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(size * 0.7, -4, size * 0.1, 8);
  
  ctx.restore();
};

export const drawProjectile = (ctx: CanvasRenderingContext2D, projectile: Projectile, tanks: Tank[]) => {
  const { position } = projectile;
  const size = GAME_CONFIG.projectileSize;
  const ownerTank = tanks.find(t => t.id === projectile.ownerId);
  const color = ownerTank?.color || '#fde047';
  
  // Enhanced glow for high damage projectiles
  if (projectile.damage > 100) {
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 20;
  } else {
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
  }
  
  // Trail
  const trailLength = 5;
  const velMag = Math.sqrt(projectile.velocity.x ** 2 + projectile.velocity.y ** 2);
  const normVel = {
    x: projectile.velocity.x / velMag,
    y: projectile.velocity.y / velMag,
  };
  
  const gradient = ctx.createLinearGradient(
    position.x - normVel.x * trailLength * 3,
    position.y - normVel.y * trailLength * 3,
    position.x,
    position.y
  );
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(1, color);
  
  ctx.strokeStyle = gradient;
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(position.x - normVel.x * trailLength * 3, position.y - normVel.y * trailLength * 3);
  ctx.lineTo(position.x, position.y);
  ctx.stroke();
  
  // Main projectile
  ctx.fillStyle = projectile.damage > 100 ? '#a855f7' : '#fff';
  ctx.beginPath();
  ctx.arc(position.x, position.y, projectile.damage > 100 ? size * 1.5 : size, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.shadowBlur = 0;
};

export const drawExplosion = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number,
  color: string
) => {
  const maxRadius = 40;
  const radius = maxRadius * progress;
  const alpha = 1 - progress;
  
  ctx.save();
  
  // Outer glow
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
  gradient.addColorStop(0.3, `${color}${Math.floor(alpha * 200).toString(16).padStart(2, '0')}`);
  gradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner flash
  if (progress < 0.3) {
    ctx.fillStyle = `rgba(255, 255, 255, ${(0.3 - progress) * 3})`;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
};

export const drawRespawnIndicator = (ctx: CanvasRenderingContext2D, tank: Tank, progress: number) => {
  const { position, color } = tank;
  const radius = GAME_CONFIG.tankSize;
  
  ctx.save();
  ctx.translate(position.x, position.y);
  
  // Respawn ring
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.3;
  ctx.beginPath();
  ctx.arc(0, 0, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
  ctx.stroke();
  
  // Pulsing center
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.3 * (1 + Math.sin(Date.now() / 150) * 0.2), 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
};

export const renderGame = (
  ctx: CanvasRenderingContext2D,
  gameState: GameState,
  explosions: Array<{ x: number; y: number; startTime: number; color: string }>
) => {
  const { canvasWidth, canvasHeight } = GAME_CONFIG;
  
  // Clear and draw background
  ctx.fillStyle = '#0a0e14';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // Draw grid
  drawGrid(ctx);
  
  // Draw walls
  gameState.walls.forEach(wall => drawWall(ctx, wall));
  
  // Draw power-ups
  gameState.powerUps.forEach(powerUp => drawPowerUp(ctx, powerUp));
  
  // Draw respawn indicators
  gameState.tanks.forEach((tank, index) => {
    if (!tank.isAlive && tank.respawnTimer > 0) {
      const progress = 1 - (tank.respawnTimer / GAME_CONFIG.respawnTime);
      drawRespawnIndicator(ctx, tank, progress);
    }
  });
  
  // Draw tanks
  gameState.tanks.forEach(tank => drawTank(ctx, tank));
  
  // Draw projectiles
  gameState.projectiles.forEach(projectile => drawProjectile(ctx, projectile, gameState.tanks));
  
  // Draw explosions
  const now = Date.now();
  explosions.forEach(explosion => {
    const elapsed = now - explosion.startTime;
    const duration = 300;
    if (elapsed < duration) {
      const progress = elapsed / duration;
      drawExplosion(ctx, explosion.x, explosion.y, progress, explosion.color);
    }
  });
};
