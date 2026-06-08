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
export type PowerUpType = 'rapidFire' | 'tripleShot' | 'shield' | 'scoreMultiplier' | 'slowTime';

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

export const POWER_UP_TYPES = ['rapidFire', 'tripleShot', 'shield', 'scoreMultiplier', 'slowTime'] as const satisfies readonly PowerUpType[];

export const POWER_UP_LABELS: Record<PowerUpType, string> = {
  rapidFire: 'Rapid Fire',
  tripleShot: 'Triple Shot',
  shield: 'Shield',
  scoreMultiplier: '2x Score',
  slowTime: 'Slow Time',
};

export const POWER_UP_TINTS: Record<PowerUpType, number> = {
  rapidFire: 0x57e2e5,
  tripleShot: 0x7cff6b,
  shield: 0x4dd2ff,
  scoreMultiplier: 0xfff275,
  slowTime: 0xc492ff,
};
