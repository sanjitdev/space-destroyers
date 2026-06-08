export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 800;
export const GAME_DURATION_MS = 60_000;
export const PLAYER_LIVES = 3;
export const PLAYER_SPEED = 360;
export const PLAYER_FIRE_COOLDOWN_MS = 220;
export const PLAYER_INVULNERABILITY_MS = 1_200;
export const BULLET_SPEED = -680;
export const POWER_UP_DURATION_MS = 10_000;
export const POWER_UP_DROP_CHANCE = 0.22;
export const POWER_UP_SPEED = 180;
export const DIFFICULTY_STEP_MS = 10_000;

export type EnemyType = 'small' | 'medium' | 'heavy';
export type PowerUpType = 'rapidFire' | 'tripleShot' | 'shield' | 'scoreMultiplier' | 'slowTime' | 'laser';

export interface EnemyConfig {
  type: EnemyType;
  texture: string;
  health: number;
  speed: number;
  points: number;
  tint: number;
  scale: number;
}

export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  small: { type: 'small', texture: 'enemy-small', health: 1, speed: 170, points: 10, tint: 0xff5c8a, scale: 1 },
  medium: { type: 'medium', texture: 'enemy-medium', health: 2, speed: 135, points: 25, tint: 0xffc857, scale: 1.08 },
  heavy: { type: 'heavy', texture: 'enemy-heavy', health: 5, speed: 92, points: 50, tint: 0xb084ff, scale: 1.16 },
};

export const POWER_UP_TYPES = ['rapidFire', 'tripleShot', 'shield', 'scoreMultiplier', 'slowTime', 'laser'] as const satisfies readonly PowerUpType[];

export const POWER_UP_LABELS: Record<PowerUpType, string> = {
  rapidFire: 'Rapid Fire',
  tripleShot: 'Triple Shot',
  shield: 'Shield',
  scoreMultiplier: '2x Score',
  slowTime: 'Slow Time',
  laser: 'MEGA LASER',
};

export const POWER_UP_TINTS: Record<PowerUpType, number> = {
  rapidFire: 0x57e2e5,
  tripleShot: 0x7cff6b,
  shield: 0x4dd2ff,
  scoreMultiplier: 0xfff275,
  slowTime: 0xc492ff,
  laser: 0xffffff,
};

// ── Game mode ──────────────────────────────────────────────────────────────
export type GameMode = 'timed' | 'infinite';

// ── Theme system ───────────────────────────────────────────────────────────
export type ThemeId = 'blue' | 'purple' | 'red' | 'green' | 'gold';

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  bgTint: number;
  bulletTint: number;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  blue:   { id: 'blue',   label: 'Blue',   bgTint: 0x78a6ff, bulletTint: 0x57e2e5 },
  purple: { id: 'purple', label: 'Purple', bgTint: 0xb088ff, bulletTint: 0xd0a0ff },
  red:    { id: 'red',    label: 'Red',    bgTint: 0xff9080, bulletTint: 0xff6699 },
  green:  { id: 'green',  label: 'Green',  bgTint: 0x80ffa0, bulletTint: 0x90ff70 },
  gold:   { id: 'gold',   label: 'Gold',   bgTint: 0xffd070, bulletTint: 0xffe060 },
};

export const THEME_IDS = ['blue', 'purple', 'red', 'green', 'gold'] as const satisfies readonly ThemeId[];

// ── Ship system ────────────────────────────────────────────────────────────
export interface ShipConfig {
  id: string;
  label: string;
  texture: string;
  unlockScore: number;
  speedMod: number;
  cooldownMod: number;
  description: string;
}

export const SHIP_CONFIGS: ShipConfig[] = [
  { id: 'falcon',  label: 'Falcon',  texture: 'player',       unlockScore: 0,    speedMod: 1.00, cooldownMod: 1.00, description: 'Balanced' },
  { id: 'viper',   label: 'Viper',   texture: 'ship-viper',   unlockScore: 500,  speedMod: 1.20, cooldownMod: 1.10, description: 'Fast · Standard fire' },
  { id: 'nova',    label: 'Nova',    texture: 'ship-nova',    unlockScore: 1500, speedMod: 0.90, cooldownMod: 0.65, description: 'Rapid fire · Slower' },
  { id: 'phantom', label: 'Phantom', texture: 'ship-phantom', unlockScore: 3000, speedMod: 1.15, cooldownMod: 0.80, description: 'Agile · Fast fire' },
  { id: 'titan',   label: 'Titan',   texture: 'ship-titan',   unlockScore: 6000, speedMod: 0.85, cooldownMod: 0.55, description: 'Heavy · Rapid fire' },
];

export const getPlayerLevel = (highScore: number): number =>
  SHIP_CONFIGS.filter(s => highScore >= s.unlockScore).length - 1;
