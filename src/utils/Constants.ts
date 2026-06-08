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

export type EnemyType = 'small' | 'medium' | 'heavy';
export type PowerUpType = 'rapidFire' | 'tripleShot' | 'shield' | 'scoreMultiplier' | 'slowTime' | 'laser' | 'extraLife';

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
  small:  { type: 'small',  texture: 'enemy-small',  health: 1, speed: 170, points: 10, tint: 0xffffff, scale: 1 },
  medium: { type: 'medium', texture: 'enemy-medium', health: 2, speed: 135, points: 25, tint: 0xffffff, scale: 1 },
  heavy:  { type: 'heavy',  texture: 'enemy-heavy',  health: 5, speed: 92,  points: 50, tint: 0xffffff, scale: 1 },
};

export const POWER_UP_TYPES = ['rapidFire', 'tripleShot', 'shield', 'scoreMultiplier', 'slowTime', 'laser', 'extraLife'] as const satisfies readonly PowerUpType[];

export const POWER_UP_LABELS: Record<PowerUpType, string> = {
  rapidFire: 'Rapid Fire',
  tripleShot: 'Triple Shot',
  shield: 'Shield',
  scoreMultiplier: '2x Score',
  slowTime: 'Slow Time',
  laser: 'MEGA LASER',
  extraLife: '+1 Life',
};

export const POWER_UP_TINTS: Record<PowerUpType, number> = {
  rapidFire: 0x57e2e5,
  tripleShot: 0x7cff6b,
  shield: 0x4dd2ff,
  scoreMultiplier: 0xfff275,
  slowTime: 0xc492ff,
  laser: 0xffffff,
  extraLife: 0xff5c8a,
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
  /** Scale applied in-game to the sprite (accounts for texture pixel size). */
  gameScale: number;
  /** Scale applied to the menu ship-selector preview image. */
  previewScale: number;
}

export const SHIP_CONFIGS: ShipConfig[] = [
  { id: 'falcon',  label: 'Falcon',  texture: 'player',       unlockScore: 0,    speedMod: 1.00, cooldownMod: 1.00, description: 'Balanced',            gameScale: 1.0,   previewScale: 1.5  },
  { id: 'viper',   label: 'Viper',   texture: 'ship-viper',   unlockScore: 500,  speedMod: 1.20, cooldownMod: 1.10, description: 'Fast · Standard fire', gameScale: 3.0,   previewScale: 3.0  },
  { id: 'nova',    label: 'Nova',    texture: 'ship-nova',    unlockScore: 1500, speedMod: 0.90, cooldownMod: 0.65, description: 'Rapid fire · Slower',  gameScale: 3.0,   previewScale: 3.0  },
  { id: 'phantom', label: 'Phantom', texture: 'ship-phantom', unlockScore: 3000, speedMod: 1.15, cooldownMod: 0.80, description: 'Agile · Fast fire',    gameScale: 3.0,   previewScale: 3.0  },
  { id: 'titan',   label: 'Titan',   texture: 'ship-titan',   unlockScore: 6000, speedMod: 0.85, cooldownMod: 0.55, description: 'Heavy · Rapid fire',   gameScale: 3.0,   previewScale: 3.0  },
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
  { level: 1,  name: 'Sentinel',   maxHp: 60,  phase2Hp: 30,  lateralSpeed: 90,  phase2LateralSpeed: 150, fireIntervalMs: 1400, phase2FireIntervalMs: 800,  phase2ShotCount: 3, glowTint: 0xff2200, phase2GlowTint: 0xff5500, bodyTint: null,     specialAbility: 'none',         killsRequired: 15  },
  { level: 2,  name: 'Hydra',      maxHp: 90,  phase2Hp: 45,  lateralSpeed: 100, phase2LateralSpeed: 160, fireIntervalMs: 1200, phase2FireIntervalMs: 700,  phase2ShotCount: 3, glowTint: 0xaa00ff, phase2GlowTint: 0xdd44ff, bodyTint: 0xcc44ff, specialAbility: 'drone_spawn',  killsRequired: 35  },
  { level: 3,  name: 'Pulsar',     maxHp: 120, phase2Hp: 60,  lateralSpeed: 110, phase2LateralSpeed: 170, fireIntervalMs: 1000, phase2FireIntervalMs: 600,  phase2ShotCount: 3, glowTint: 0x00aaff, phase2GlowTint: 0x44ddff, bodyTint: 0x22ccff, specialAbility: 'emp_pulse',    killsRequired: 60  },
  { level: 4,  name: 'Reaper',     maxHp: 150, phase2Hp: 75,  lateralSpeed: 120, phase2LateralSpeed: 180, fireIntervalMs: 900,  phase2FireIntervalMs: 550,  phase2ShotCount: 3, glowTint: 0xff0000, phase2GlowTint: 0xff4400, bodyTint: 0xff2200, specialAbility: 'aimed',        killsRequired: 90  },
  { level: 5,  name: 'Titan',      maxHp: 190, phase2Hp: 95,  lateralSpeed: 100, phase2LateralSpeed: 165, fireIntervalMs: 800,  phase2FireIntervalMs: 500,  phase2ShotCount: 5, glowTint: 0xff6600, phase2GlowTint: 0xff9900, bodyTint: 0xff8800, specialAbility: 'meteor_shower', killsRequired: 125 },
  { level: 6,  name: 'Phantom',    maxHp: 230, phase2Hp: 115, lateralSpeed: 130, phase2LateralSpeed: 190, fireIntervalMs: 700,  phase2FireIntervalMs: 450,  phase2ShotCount: 3, glowTint: 0x9900ff, phase2GlowTint: 0xcc44ff, bodyTint: 0xbb00ff, specialAbility: 'teleport',     killsRequired: 165 },
  { level: 7,  name: 'Nexus',      maxHp: 280, phase2Hp: 140, lateralSpeed: 140, phase2LateralSpeed: 200, fireIntervalMs: 650,  phase2FireIntervalMs: 400,  phase2ShotCount: 5, glowTint: 0x00ffcc, phase2GlowTint: 0x44ffdd, bodyTint: 0x00ddaa, specialAbility: 'summon',       killsRequired: 210 },
  { level: 8,  name: 'Devourer',   maxHp: 330, phase2Hp: 165, lateralSpeed: 150, phase2LateralSpeed: 210, fireIntervalMs: 600,  phase2FireIntervalMs: 350,  phase2ShotCount: 5, glowTint: 0x660099, phase2GlowTint: 0xaa00ff, bodyTint: 0x8800bb, specialAbility: 'homing',       killsRequired: 260 },
  { level: 9,  name: 'Apocalypse', maxHp: 390, phase2Hp: 195, lateralSpeed: 160, phase2LateralSpeed: 220, fireIntervalMs: 500,  phase2FireIntervalMs: 300,  phase2ShotCount: 7, glowTint: 0xff0033, phase2GlowTint: 0xff4466, bodyTint: 0xff0055, specialAbility: 'bulletHell',   killsRequired: 315 },
  { level: 10, name: 'Omega',      maxHp: 500, phase2Hp: 250, lateralSpeed: 170, phase2LateralSpeed: 230, fireIntervalMs: 450,  phase2FireIntervalMs: 250,  phase2ShotCount: 7, glowTint: 0xffcc00, phase2GlowTint: 0xffee44, bodyTint: 0xffdd00, specialAbility: 'omega',        killsRequired: 375 },
];
