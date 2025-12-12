import { Wall, MapConfig, GAME_CONFIG } from './types';

const { canvasWidth, canvasHeight, wallThickness } = GAME_CONFIG;

// Border walls shared by all maps
const borderWalls: Wall[] = [
  { x: 0, y: 0, width: canvasWidth, height: wallThickness, destructible: false, health: -1 },
  { x: 0, y: canvasHeight - wallThickness, width: canvasWidth, height: wallThickness, destructible: false, health: -1 },
  { x: 0, y: 0, width: wallThickness, height: canvasHeight, destructible: false, health: -1 },
  { x: canvasWidth - wallThickness, y: 0, width: wallThickness, height: canvasHeight, destructible: false, health: -1 },
];

export const MAPS: MapConfig[] = [
  {
    id: 1,
    name: 'Classic Arena',
    walls: [
      ...borderWalls,
      // Center obstacles
      { x: canvasWidth / 2 - 60, y: 100, width: 120, height: 30, destructible: true, health: 3 },
      { x: canvasWidth / 2 - 60, y: canvasHeight - 130, width: 120, height: 30, destructible: true, health: 3 },
      { x: canvasWidth / 2 - 15, y: canvasHeight / 2 - 80, width: 30, height: 160, destructible: true, health: 3 },
      // Side obstacles
      { x: 200, y: 150, width: 30, height: 120, destructible: true, health: 2 },
      { x: 200, y: canvasHeight - 270, width: 30, height: 120, destructible: true, health: 2 },
      { x: canvasWidth - 230, y: 150, width: 30, height: 120, destructible: true, health: 2 },
      { x: canvasWidth - 230, y: canvasHeight - 270, width: 30, height: 120, destructible: true, health: 2 },
      // Corner blocks
      { x: 80, y: 80, width: 50, height: 50, destructible: false, health: -1 },
      { x: canvasWidth - 130, y: 80, width: 50, height: 50, destructible: false, health: -1 },
      { x: 80, y: canvasHeight - 130, width: 50, height: 50, destructible: false, health: -1 },
      { x: canvasWidth - 130, y: canvasHeight - 130, width: 50, height: 50, destructible: false, health: -1 },
    ],
  },
  {
    id: 2,
    name: 'Maze Runner',
    walls: [
      ...borderWalls,
      // Horizontal maze walls
      { x: 150, y: 120, width: 250, height: 25, destructible: false, health: -1 },
      { x: canvasWidth - 400, y: 120, width: 250, height: 25, destructible: false, health: -1 },
      { x: 150, y: canvasHeight - 145, width: 250, height: 25, destructible: false, health: -1 },
      { x: canvasWidth - 400, y: canvasHeight - 145, width: 250, height: 25, destructible: false, health: -1 },
      // Vertical maze walls
      { x: 300, y: 220, width: 25, height: 160, destructible: true, health: 2 },
      { x: canvasWidth - 325, y: 220, width: 25, height: 160, destructible: true, health: 2 },
      // Center cross
      { x: canvasWidth / 2 - 100, y: canvasHeight / 2 - 12, width: 200, height: 25, destructible: true, health: 3 },
      { x: canvasWidth / 2 - 12, y: canvasHeight / 2 - 100, width: 25, height: 200, destructible: true, health: 3 },
    ],
  },
  {
    id: 3,
    name: 'Fortress',
    walls: [
      ...borderWalls,
      // Left fortress
      { x: 100, y: canvasHeight / 2 - 100, width: 150, height: 25, destructible: false, health: -1 },
      { x: 100, y: canvasHeight / 2 + 75, width: 150, height: 25, destructible: false, health: -1 },
      { x: 225, y: canvasHeight / 2 - 100, width: 25, height: 75, destructible: true, health: 2 },
      { x: 225, y: canvasHeight / 2 + 25, width: 25, height: 75, destructible: true, health: 2 },
      // Right fortress
      { x: canvasWidth - 250, y: canvasHeight / 2 - 100, width: 150, height: 25, destructible: false, health: -1 },
      { x: canvasWidth - 250, y: canvasHeight / 2 + 75, width: 150, height: 25, destructible: false, health: -1 },
      { x: canvasWidth - 250, y: canvasHeight / 2 - 100, width: 25, height: 75, destructible: true, health: 2 },
      { x: canvasWidth - 250, y: canvasHeight / 2 + 25, width: 25, height: 75, destructible: true, health: 2 },
      // Center pillars
      { x: canvasWidth / 2 - 60, y: 80, width: 40, height: 40, destructible: false, health: -1 },
      { x: canvasWidth / 2 + 20, y: 80, width: 40, height: 40, destructible: false, health: -1 },
      { x: canvasWidth / 2 - 60, y: canvasHeight - 120, width: 40, height: 40, destructible: false, health: -1 },
      { x: canvasWidth / 2 + 20, y: canvasHeight - 120, width: 40, height: 40, destructible: false, health: -1 },
    ],
  },
  {
    id: 4,
    name: 'Open Field',
    walls: [
      ...borderWalls,
      // Scattered small obstacles
      { x: 200, y: 200, width: 40, height: 40, destructible: true, health: 1 },
      { x: canvasWidth - 240, y: 200, width: 40, height: 40, destructible: true, health: 1 },
      { x: 200, y: canvasHeight - 240, width: 40, height: 40, destructible: true, health: 1 },
      { x: canvasWidth - 240, y: canvasHeight - 240, width: 40, height: 40, destructible: true, health: 1 },
      { x: canvasWidth / 2 - 20, y: canvasHeight / 2 - 20, width: 40, height: 40, destructible: true, health: 2 },
      // Corner barricades
      { x: 80, y: 80, width: 60, height: 20, destructible: false, health: -1 },
      { x: 80, y: 80, width: 20, height: 60, destructible: false, health: -1 },
      { x: canvasWidth - 140, y: 80, width: 60, height: 20, destructible: false, health: -1 },
      { x: canvasWidth - 100, y: 80, width: 20, height: 60, destructible: false, health: -1 },
      { x: 80, y: canvasHeight - 100, width: 60, height: 20, destructible: false, health: -1 },
      { x: 80, y: canvasHeight - 140, width: 20, height: 60, destructible: false, health: -1 },
      { x: canvasWidth - 140, y: canvasHeight - 100, width: 60, height: 20, destructible: false, health: -1 },
      { x: canvasWidth - 100, y: canvasHeight - 140, width: 20, height: 60, destructible: false, health: -1 },
    ],
  },
  {
    id: 5,
    name: 'Corridors',
    walls: [
      ...borderWalls,
      // Horizontal corridors
      { x: wallThickness, y: canvasHeight / 3, width: canvasWidth / 3, height: 25, destructible: false, health: -1 },
      { x: canvasWidth - canvasWidth / 3 - wallThickness, y: canvasHeight / 3, width: canvasWidth / 3, height: 25, destructible: false, health: -1 },
      { x: wallThickness, y: 2 * canvasHeight / 3, width: canvasWidth / 3, height: 25, destructible: false, health: -1 },
      { x: canvasWidth - canvasWidth / 3 - wallThickness, y: 2 * canvasHeight / 3, width: canvasWidth / 3, height: 25, destructible: false, health: -1 },
      // Vertical connectors
      { x: canvasWidth / 3, y: wallThickness, width: 25, height: canvasHeight / 3 - wallThickness, destructible: true, health: 3 },
      { x: 2 * canvasWidth / 3, y: wallThickness, width: 25, height: canvasHeight / 3 - wallThickness, destructible: true, health: 3 },
      { x: canvasWidth / 3, y: 2 * canvasHeight / 3, width: 25, height: canvasHeight / 3 - wallThickness, destructible: true, health: 3 },
      { x: 2 * canvasWidth / 3, y: 2 * canvasHeight / 3, width: 25, height: canvasHeight / 3 - wallThickness, destructible: true, health: 3 },
    ],
  },
];

export const getMapById = (id: number): MapConfig => {
  return MAPS.find(map => map.id === id) || MAPS[0];
};

export const getMapWalls = (mapId: number): Wall[] => {
  const map = getMapById(mapId);
  // Return deep copy of walls
  return map.walls.map(wall => ({ ...wall }));
};
