export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 800;
export const GAME_DURATION_MS = 60_000;
export const PLAYER_LIVES = 3;
export const PLAYER_MAX_LIVES = 5;
export const PLAYER_SPEED = 360;
export const PLAYER_FIRE_COOLDOWN_MS = 220;
export const PLAYER_INVULNERABILITY_MS = 1_200;
export const BULLET_SPEED = -680;
export const POWER_UP_DURATION_MS = 10_000;
export const POWER_UP_DROP_CHANCE = 0.22;
export const POWER_UP_SPEED = 180;
export const DIFFICULTY_STEP_MS = 10_000;

export type EnemyType = 'small' | 'medium' | 'heavy' | 'striker' | 'bomber' | 'destroyer';
export type PowerUpType = 'rapidFire' | 'tripleShot' | 'doubleShot' | 'shield' | 'scoreMultiplier' | 'slowTime' | 'laser' | 'extraLife' | 'nuke' | 'piercingShot' | 'magnetShield' | 'ribbonLaser';

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
  small:     { type: 'small',     texture: 'enemy-small',     health: 1,  speed: 170, points: 10,  tint: 0xffffff, scale: 1 },
  medium:    { type: 'medium',    texture: 'enemy-medium',    health: 2,  speed: 135, points: 25,  tint: 0xffffff, scale: 1 },
  heavy:     { type: 'heavy',     texture: 'enemy-heavy',     health: 8,  speed: 92,  points: 50,  tint: 0xffffff, scale: 1 },
  striker:   { type: 'striker',   texture: 'enemy-striker',   health: 3,  speed: 215, points: 40,  tint: 0xffffff, scale: 1 },
  bomber:    { type: 'bomber',    texture: 'enemy-bomber',    health: 11, speed: 118, points: 80,  tint: 0xffffff, scale: 1 },
  destroyer: { type: 'destroyer', texture: 'enemy-destroyer', health: 18, speed: 84,  points: 130, tint: 0xffffff, scale: 1 },
};

export const POWER_UP_TYPES = ['rapidFire', 'tripleShot', 'doubleShot', 'shield', 'scoreMultiplier', 'slowTime', 'laser', 'extraLife', 'nuke', 'piercingShot', 'magnetShield', 'ribbonLaser'] as const satisfies readonly PowerUpType[];

export const POWER_UP_LABELS: Record<PowerUpType, string> = {
  rapidFire: 'Rapid Fire',
  tripleShot: 'Triple Shot',
  doubleShot: 'Double Shot',
  shield: 'Shield',
  scoreMultiplier: '2x Score',
  slowTime: 'Slow Time',
  laser: 'MEGA LASER',
  extraLife: '+1 Life',
  nuke: 'NUKE',
  piercingShot: 'Piercing Shot',
  magnetShield: 'Magnet Shield',
  ribbonLaser: 'Ribbon Laser',
};

export const POWER_UP_TINTS: Record<PowerUpType, number> = {
  rapidFire: 0x57e2e5,
  tripleShot: 0x7cff6b,
  doubleShot: 0xffaa44,
  shield: 0x4dd2ff,
  scoreMultiplier: 0xfff275,
  slowTime: 0xc492ff,
  laser: 0xffffff,
  extraLife: 0xff5c8a,
  nuke: 0xff6600,
  piercingShot: 0xffeedd,
  magnetShield: 0x00ddff,
  ribbonLaser: 0xff44ff,
};

// Drop weight for each power-up (higher = more common)
export const POWER_UP_WEIGHTS: Record<PowerUpType, number> = {
  extraLife:       20,
  rapidFire:       16,
  tripleShot:      14,
  doubleShot:      13,
  shield:          12,
  magnetShield:    10,
  scoreMultiplier: 10,
  piercingShot:     8,
  slowTime:         6,
  ribbonLaser:      4,
  laser:            3,
  nuke:             2,
};

// ── Game mode ──────────────────────────────────────────────────────────────
export type GameMode = 'timed' | 'infinite';

// ── Difficulty system ───────────────────────────────────────────────────────
export type DifficultyId = 'easy' | 'normal' | 'hard';

export interface DifficultyPreset {
  readonly id: DifficultyId;
  readonly label: string;
  readonly description: string;
  readonly spawnIntervalScale: number;
  readonly speedScale: number;
}

export const DIFFICULTY_PRESETS: Record<DifficultyId, DifficultyPreset> = {
  easy: {
    id: 'easy',
    label: 'Easy',
    description: 'Softer enemy pacing',
    spawnIntervalScale: 1.18,
    speedScale: 0.88,
  },
  normal: {
    id: 'normal',
    label: 'Normal',
    description: 'Default challenge',
    spawnIntervalScale: 1,
    speedScale: 1,
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    description: 'Fast, dense pressure',
    spawnIntervalScale: 0.86,
    speedScale: 1.14,
  },
};

export const DIFFICULTY_IDS = ['easy', 'normal', 'hard'] as const satisfies readonly DifficultyId[];

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
  /** Scale applied in-game to the sprite (accounts for texture pixel size). */
  gameScale: number;
  /** Scale applied to the menu ship-selector preview image. */
  previewScale: number;
}

const SHIP_GAME_SCALE = 0.28;
const SHIP_PREVIEW_SCALE = 0.23;

export const SHIP_CONFIGS: ShipConfig[] = [
  { id: 'ship-1',  label: 'Ship I',   texture: 'spaceship_1',  unlockScore: 0,    speedMod: 1.00, cooldownMod: 1.00, description: 'Level 1 hull',  gameScale: SHIP_GAME_SCALE, previewScale: SHIP_PREVIEW_SCALE },
  { id: 'ship-2',  label: 'Ship II',  texture: 'spaceship_2',  unlockScore: 400,  speedMod: 1.00, cooldownMod: 1.00, description: 'Level 2 hull',  gameScale: SHIP_GAME_SCALE, previewScale: SHIP_PREVIEW_SCALE },
  { id: 'ship-3',  label: 'Ship III', texture: 'spaceship_3',  unlockScore: 900,  speedMod: 1.00, cooldownMod: 1.00, description: 'Level 3 hull',  gameScale: SHIP_GAME_SCALE, previewScale: SHIP_PREVIEW_SCALE },
  { id: 'ship-4',  label: 'Ship IV',  texture: 'spaceship_4',  unlockScore: 1500, speedMod: 1.00, cooldownMod: 1.00, description: 'Level 4 hull',  gameScale: SHIP_GAME_SCALE, previewScale: SHIP_PREVIEW_SCALE },
  { id: 'ship-5',  label: 'Ship V',   texture: 'spaceship_5',  unlockScore: 2200, speedMod: 1.00, cooldownMod: 1.00, description: 'Level 5 hull',  gameScale: SHIP_GAME_SCALE, previewScale: SHIP_PREVIEW_SCALE },
  { id: 'ship-6',  label: 'Ship VI',  texture: 'spaceship_6',  unlockScore: 3000, speedMod: 1.00, cooldownMod: 1.00, description: 'Level 6 hull',  gameScale: SHIP_GAME_SCALE, previewScale: SHIP_PREVIEW_SCALE },
  { id: 'ship-7',  label: 'Ship VII', texture: 'spaceship_7',  unlockScore: 3900, speedMod: 1.00, cooldownMod: 1.00, description: 'Level 7 hull',  gameScale: SHIP_GAME_SCALE, previewScale: SHIP_PREVIEW_SCALE },
  { id: 'ship-8',  label: 'Ship VIII',texture: 'spaceship_8',  unlockScore: 4900, speedMod: 1.00, cooldownMod: 1.00, description: 'Level 8 hull',  gameScale: SHIP_GAME_SCALE, previewScale: SHIP_PREVIEW_SCALE },
  { id: 'ship-9',  label: 'Ship IX',  texture: 'spaceship_9',  unlockScore: 6000, speedMod: 1.00, cooldownMod: 1.00, description: 'Level 9 hull',  gameScale: SHIP_GAME_SCALE, previewScale: SHIP_PREVIEW_SCALE },
  { id: 'ship-10', label: 'Ship X',   texture: 'spaceship_10', unlockScore: 7500, speedMod: 1.00, cooldownMod: 1.00, description: 'Level 10 hull', gameScale: SHIP_GAME_SCALE, previewScale: SHIP_PREVIEW_SCALE },
];

export const getPlayerLevel = (highScore: number): number =>
  SHIP_CONFIGS.filter(s => highScore >= s.unlockScore).length - 1;

// ── Boss level system ──────────────────────────────────────────────────────
export type BossSpecialAbility =
  | 'none'
  | 'drone_spawn'
  | 'emp_pulse'
  | 'aimed'
  | 'meteor_shower'
  | 'teleport'
  | 'summon'
  | 'homing'
  | 'bulletHell'
  | 'omega';

export interface BossLevelConfig {
  readonly level: number;
  readonly name: string;
  readonly texture: string;
  readonly maxHp: number;
  readonly phase2Hp: number;
  readonly lateralSpeed: number;
  readonly phase2LateralSpeed: number;
  readonly fireIntervalMs: number;
  readonly phase2FireIntervalMs: number;
  readonly phase2ShotCount: number;
  readonly glowTint: number;
  readonly phase2GlowTint: number;
  readonly bodyTint: number | null;
  readonly specialAbility: BossSpecialAbility;
  readonly killsRequired: number;
}

export const BOSS_LEVEL_CONFIGS: readonly BossLevelConfig[] = [
  { level: 1,  name: 'Sentinel',   texture: 'boss-1',  maxHp: 60,  phase2Hp: 30,  lateralSpeed: 90,  phase2LateralSpeed: 150, fireIntervalMs: 1400, phase2FireIntervalMs: 800,  phase2ShotCount: 3, glowTint: 0xff2200, phase2GlowTint: 0xff5500, bodyTint: null, specialAbility: 'none',          killsRequired: 15  },
  { level: 2,  name: 'Hydra',      texture: 'boss-2',  maxHp: 90,  phase2Hp: 45,  lateralSpeed: 100, phase2LateralSpeed: 160, fireIntervalMs: 1200, phase2FireIntervalMs: 700,  phase2ShotCount: 3, glowTint: 0x44ff00, phase2GlowTint: 0x88ff44, bodyTint: null, specialAbility: 'drone_spawn',   killsRequired: 35  },
  { level: 3,  name: 'Pulsar',     texture: 'boss-3',  maxHp: 120, phase2Hp: 60,  lateralSpeed: 110, phase2LateralSpeed: 170, fireIntervalMs: 1000, phase2FireIntervalMs: 600,  phase2ShotCount: 3, glowTint: 0x0099ff, phase2GlowTint: 0x44ddff, bodyTint: null, specialAbility: 'emp_pulse',     killsRequired: 60  },
  { level: 4,  name: 'Reaper',     texture: 'boss-4',  maxHp: 150, phase2Hp: 75,  lateralSpeed: 120, phase2LateralSpeed: 180, fireIntervalMs: 900,  phase2FireIntervalMs: 550,  phase2ShotCount: 3, glowTint: 0xaa00ff, phase2GlowTint: 0xdd44ff, bodyTint: null, specialAbility: 'aimed',         killsRequired: 90  },
  { level: 5,  name: 'Titan',      texture: 'boss-5',  maxHp: 190, phase2Hp: 95,  lateralSpeed: 100, phase2LateralSpeed: 165, fireIntervalMs: 800,  phase2FireIntervalMs: 500,  phase2ShotCount: 5, glowTint: 0xff6600, phase2GlowTint: 0xff9900, bodyTint: null, specialAbility: 'meteor_shower', killsRequired: 125 },
  { level: 6,  name: 'Phantom',    texture: 'boss-6',  maxHp: 230, phase2Hp: 115, lateralSpeed: 130, phase2LateralSpeed: 190, fireIntervalMs: 700,  phase2FireIntervalMs: 450,  phase2ShotCount: 3, glowTint: 0x00ddcc, phase2GlowTint: 0x44ffee, bodyTint: null, specialAbility: 'teleport',      killsRequired: 165 },
  { level: 7,  name: 'Nexus',      texture: 'boss-7',  maxHp: 280, phase2Hp: 140, lateralSpeed: 140, phase2LateralSpeed: 200, fireIntervalMs: 650,  phase2FireIntervalMs: 400,  phase2ShotCount: 5, glowTint: 0x00ff44, phase2GlowTint: 0x44ff88, bodyTint: null, specialAbility: 'summon',        killsRequired: 210 },
  { level: 8,  name: 'Devourer',   texture: 'boss-8',  maxHp: 330, phase2Hp: 165, lateralSpeed: 150, phase2LateralSpeed: 210, fireIntervalMs: 600,  phase2FireIntervalMs: 350,  phase2ShotCount: 5, glowTint: 0xff0055, phase2GlowTint: 0xff4488, bodyTint: null, specialAbility: 'homing',        killsRequired: 260 },
  { level: 9,  name: 'Apocalypse', texture: 'boss-9',  maxHp: 390, phase2Hp: 195, lateralSpeed: 160, phase2LateralSpeed: 220, fireIntervalMs: 500,  phase2FireIntervalMs: 300,  phase2ShotCount: 7, glowTint: 0xff0000, phase2GlowTint: 0xff4400, bodyTint: null, specialAbility: 'bulletHell',    killsRequired: 315 },
  { level: 10, name: 'Omega',      texture: 'boss-10', maxHp: 500, phase2Hp: 250, lateralSpeed: 170, phase2LateralSpeed: 230, fireIntervalMs: 450,  phase2FireIntervalMs: 250,  phase2ShotCount: 7, glowTint: 0xffcc00, phase2GlowTint: 0xffee44, bodyTint: null, specialAbility: 'omega',         killsRequired: 375 },
];
