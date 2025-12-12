import React, { useRef, useEffect, useCallback, useState } from 'react';
import { 
  GameState, 
  GAME_CONFIG, 
  PLAYER_CONTROLS,
  AdminCheats,
} from '@/game/types';
import {
  createInitialGameState,
  handleTankMovement,
  shootProjectile,
  updateProjectile,
  checkProjectileTankCollision,
  checkPowerUpCollision,
  respawnTank,
  spawnPowerUp,
  applyPowerUp,
  resetRound,
} from '@/game/gameEngine';
import { renderGame } from '@/game/renderer';

interface GameCanvasProps {
  onScoreUpdate: (scores: number[]) => void;
  onGameOver: (winner: number) => void;
  onRoundWin: (playerIndex: number) => void;
  isPaused: boolean;
  onRestart: () => void;
  mapId?: number;
  roundsToWin?: number;
  adminCheats?: AdminCheats;
}

interface Explosion {
  x: number;
  y: number;
  startTime: number;
  color: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  onScoreUpdate,
  onGameOver,
  onRoundWin,
  isPaused,
  onRestart,
  mapId = 1,
  roundsToWin = 3,
  adminCheats,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>(createInitialGameState(mapId, roundsToWin));
  const keysPressed = useRef<Set<string>>(new Set());
  const explosionsRef = useRef<Explosion[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const lastPowerUpSpawn = useRef<number>(Date.now());

  const addExplosion = (x: number, y: number, color: string) => {
    explosionsRef.current.push({ x, y, startTime: Date.now(), color });
    explosionsRef.current = explosionsRef.current.filter(
      e => Date.now() - e.startTime < 500
    );
  };

  const resetGame = useCallback(() => {
    gameStateRef.current = createInitialGameState(mapId, roundsToWin);
    explosionsRef.current = [];
    onScoreUpdate([0, 0]);
  }, [onScoreUpdate, mapId, roundsToWin]);

  const gameLoop = useCallback((timestamp: number) => {
    if (isPaused) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    const now = Date.now();
    const state = gameStateRef.current;

    // Spawn power-ups
    if (now - lastPowerUpSpawn.current > GAME_CONFIG.powerUpSpawnInterval) {
      const newPowerUp = spawnPowerUp(state.walls, state.tanks, state.powerUps);
      if (newPowerUp) {
        gameStateRef.current.powerUps = [...state.powerUps, newPowerUp];
      }
      lastPowerUpSpawn.current = now;
    }

    // Remove expired power-ups
    gameStateRef.current.powerUps = state.powerUps.filter(
      p => now - p.createdAt < 15000
    );

    // Update tanks
    let updatedTanks = state.tanks.map((tank, index) => {
      if (!tank.isAlive) {
        if (tank.respawnTimer > 0) {
          const newTimer = tank.respawnTimer - deltaTime;
          if (newTimer <= 0) {
            return respawnTank(tank, index);
          }
          return { ...tank, respawnTimer: newTimer };
        }
        return tank;
      }

      const otherTank = state.tanks[1 - index];
      return handleTankMovement(tank, keysPressed.current, index, state.walls, otherTank, adminCheats);
    });

    // Check power-up collisions
    let remainingPowerUps = [...gameStateRef.current.powerUps];
    updatedTanks = updatedTanks.map((tank, index) => {
      if (!tank.isAlive) return tank;
      
      for (let i = remainingPowerUps.length - 1; i >= 0; i--) {
        if (checkPowerUpCollision(tank, remainingPowerUps[i])) {
          tank = applyPowerUp(tank, remainingPowerUps[i]);
          addExplosion(remainingPowerUps[i].position.x, remainingPowerUps[i].position.y, '#ffffff');
          remainingPowerUps.splice(i, 1);
        }
      }
      return tank;
    });
    gameStateRef.current.powerUps = remainingPowerUps;

    // Handle shooting
    const newProjectiles: typeof state.projectiles = [];
    
    updatedTanks.forEach((tank, index) => {
      const controls = index === 0 ? PLAYER_CONTROLS.player1 : PLAYER_CONTROLS.player2;
      if (keysPressed.current.has(controls.shoot)) {
        const projectile = shootProjectile(tank, now, adminCheats);
        if (projectile) {
          newProjectiles.push(projectile);
          updatedTanks[index] = { ...tank, lastShot: now };
        }
      }
    });

    // Update projectiles
    let projectiles = [...state.projectiles, ...newProjectiles];
    const projectilesToRemove: number[] = [];
    const updatedWalls = [...state.walls];

    projectiles = projectiles.map(projectile => {
      const { projectile: updated, wallHit } = updateProjectile(projectile, state.walls, now);
      
      if (wallHit && wallHit.destructible && wallHit.health > 0) {
        const wallIndex = updatedWalls.findIndex(w => w === wallHit);
        if (wallIndex !== -1) {
          updatedWalls[wallIndex] = { ...wallHit, health: wallHit.health - 1 };
          addExplosion(projectile.position.x, projectile.position.y, '#94a3b8');
        }
      }
      
      if (!updated) {
        projectilesToRemove.push(projectile.id);
        return projectile;
      }
      return updated;
    }).filter(p => !projectilesToRemove.includes(p.id));

    // Check projectile-tank collisions
    let scores = [...state.scores];
    let roundWins = [...state.roundWins];
    
    projectiles = projectiles.filter(projectile => {
      for (let i = 0; i < updatedTanks.length; i++) {
        if (checkProjectileTankCollision(projectile, updatedTanks[i])) {
          // Check god mode
          if (adminCheats?.enabled && adminCheats.godMode && adminCheats.playerId === updatedTanks[i].id) {
            return false; // Destroy projectile but don't damage tank
          }
          
          // Check shield
          if (updatedTanks[i].hasShield) {
            updatedTanks[i] = {
              ...updatedTanks[i],
              hasShield: false,
              activePowerUps: updatedTanks[i].activePowerUps.filter(p => p.type !== 'shield'),
            };
            addExplosion(updatedTanks[i].position.x, updatedTanks[i].position.y, '#3b82f6');
            return false;
          }
          
          updatedTanks[i] = {
            ...updatedTanks[i],
            health: 0,
            isAlive: false,
            respawnTimer: GAME_CONFIG.respawnTime,
          };
          
          const shooterIndex = projectile.ownerId === 1 ? 0 : 1;
          scores[shooterIndex]++;
          
          addExplosion(
            updatedTanks[i].position.x,
            updatedTanks[i].position.y,
            updatedTanks[i].color
          );
          
          // Check round win condition
          if (scores[shooterIndex] >= GAME_CONFIG.winScore) {
            roundWins[shooterIndex]++;
            onRoundWin(shooterIndex);
            
            // Check match win condition
            if (roundWins[shooterIndex] >= roundsToWin) {
              gameStateRef.current = {
                ...state,
                tanks: updatedTanks,
                projectiles: [],
                walls: updatedWalls,
                scores,
                roundWins,
                gameOver: true,
                winner: shooterIndex + 1,
              };
              onScoreUpdate(scores);
              onGameOver(shooterIndex + 1);
              return false;
            }
            
            // Start new round
            setTimeout(() => {
              gameStateRef.current = {
                ...resetRound(gameStateRef.current),
                roundWins,
                currentRound: gameStateRef.current.currentRound + 1,
              };
              onScoreUpdate([0, 0]);
            }, 2000);
          }
          
          onScoreUpdate(scores);
          return false;
        }
      }
      return true;
    });

    gameStateRef.current = {
      ...state,
      tanks: updatedTanks,
      projectiles,
      walls: updatedWalls,
      scores,
      roundWins,
    };

    // Render
    renderGame(ctx, gameStateRef.current, explosionsRef.current);

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [isPaused, onScoreUpdate, onGameOver, onRoundWin, adminCheats, roundsToWin]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);
      if (
        Object.values(PLAYER_CONTROLS.player1).includes(e.key) ||
        Object.values(PLAYER_CONTROLS.player2).includes(e.key)
      ) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);

  return (
    <canvas
      ref={canvasRef}
      width={GAME_CONFIG.canvasWidth}
      height={GAME_CONFIG.canvasHeight}
      className="rounded-lg border-2 border-border shadow-2xl box-glow-primary scanline"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};
