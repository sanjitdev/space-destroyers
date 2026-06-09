import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { GAME_WIDTH, type EnemyType } from '../utils/Constants';
import { DifficultyManager } from './DifficultyManager';
import { getGateRequirements } from './BossProgression';
import { pickWeighted, randomBetween } from '../utils/Random';

const FORMATION_INTERVAL_MS = 12_000;
const ENEMY_ENTRY_Y = 190;
const MIN_LEVEL_DURATION_MS = 60_000;
const MAX_LEVEL_DURATION_MS = 120_000;
const LEVEL_DURATION_STEP_MS = 7_000;
const KILL_EFFICIENCY = 0.78;
const OBJECTIVE_TYPE_SPAWN_SHARE = 0.82;
const MIN_SPAWN_INTERVAL_MS = 420;
const MAX_SPAWN_INTERVAL_MS = 1_600;
const START_RAMP_FACTOR = 1.25;
const END_RAMP_FACTOR = 0.85;
const ENEMY_TYPE_REPEAT_CHANCE = 0.62;
const ENEMY_TYPE_REPEAT_MAX_STREAK = 4;

type FormationFn = (scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group, speedMult: number, progressionLevel: number) => void;

const getFormationType = (progressionLevel: number, index: number): EnemyType => {
  if (progressionLevel >= 9) return index % 2 === 0 ? 'destroyer' : 'bomber';
  if (progressionLevel >= 7) return index % 3 === 0 ? 'destroyer' : 'bomber';
  if (progressionLevel >= 5) return index % 2 === 0 ? 'bomber' : 'heavy';
  if (progressionLevel >= 3) return index % 2 === 0 ? 'striker' : 'medium';
  return 'small';
};

const isTypeUnlocked = (type: EnemyType, progressionLevel: number): boolean => {
  switch (type) {
    case 'striker':
      return progressionLevel >= 3;
    case 'bomber':
      return progressionLevel >= 5;
    case 'destroyer':
      return progressionLevel >= 7;
    default:
      return true;
  }
};

const spawnAt = (
  scene: Phaser.Scene,
  group: Phaser.Physics.Arcade.Group,
  x: number,
  y: number,
  type: EnemyType,
  speedMult: number,
  delayMs: number,
): void => {
  scene.time.delayedCall(delayMs, () => {
    const enemy = new Enemy(scene, x, y, type, speedMult);
    group.add(enemy);
  });
};

const FORMATIONS: FormationFn[] = [
  // V-shape: 5 enemies
  (scene, group, mult, progressionLevel) => {
    const cx = GAME_WIDTH / 2;
    const pts = [
      { x: cx,      y: ENEMY_ENTRY_Y },
      { x: cx - 60, y: ENEMY_ENTRY_Y + 28 },
      { x: cx + 60, y: ENEMY_ENTRY_Y + 28 },
      { x: cx - 120, y: ENEMY_ENTRY_Y + 56 },
      { x: cx + 120, y: ENEMY_ENTRY_Y + 56 },
    ];
    pts.forEach(({ x, y }, i) => spawnAt(scene, group, x, y, getFormationType(progressionLevel, i), mult, i * 60));
  },
  // Grid: 2 rows × 4 cols
  (scene, group, mult, progressionLevel) => {
    const startX = GAME_WIDTH / 2 - 90;
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        const index = row * 4 + col;
        spawnAt(scene, group, startX + col * 60, ENEMY_ENTRY_Y + row * 44, getFormationType(progressionLevel, index), mult, index * 70);
      }
    }
  },
  // Diagonal sweep: 6 enemies from left to right
  (scene, group, mult, progressionLevel) => {
    for (let i = 0; i < 6; i++) {
      spawnAt(scene, group, 48 + i * 72, ENEMY_ENTRY_Y + i * 18, getFormationType(progressionLevel, i), mult, i * 100);
    }
  },
];

export class EnemySpawnManager {
  private cooldownMs = 250;
  private formationCooldownMs = FORMATION_INTERVAL_MS;
  private progressionLevel = 1;
  private levelElapsedMs = 0;
  private lastSpawnedType: EnemyType | null = null;
  private lastSpawnStreak = 0;
  private readonly scene: Phaser.Scene;
  private readonly group: Phaser.Physics.Arcade.Group;
  private readonly difficultyManager: DifficultyManager;

  constructor(scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group, difficultyManager: DifficultyManager) {
    this.scene = scene;
    this.group = group;
    this.difficultyManager = difficultyManager;
  }

  update(deltaMs: number): void {
    this.levelElapsedMs += deltaMs;
    this.cooldownMs -= deltaMs;
    while (this.cooldownMs <= 0) {
      this.spawnEnemy();
      this.cooldownMs += this.getAdaptiveSpawnIntervalMs();
    }

    this.formationCooldownMs -= deltaMs;
    if (this.formationCooldownMs <= 0) {
      const fn = FORMATIONS[Math.floor(Math.random() * FORMATIONS.length)];
      fn(this.scene, this.group, this.difficultyManager.getEnemySpeedMultiplier(), this.progressionLevel);
      this.formationCooldownMs = FORMATION_INTERVAL_MS;
    }
  }

  setProgressionLevel(level: number): void {
    this.progressionLevel = Math.max(1, level);
    this.levelElapsedMs = 0;
    this.lastSpawnedType = null;
    this.lastSpawnStreak = 0;
    this.cooldownMs = 400;
    this.formationCooldownMs = FORMATION_INTERVAL_MS;
  }

  private spawnEnemy(): void {
    const availableWeights = this.difficultyManager
      .getEnemyWeights()
      .filter(({ value, weight }) => weight > 0 && isTypeUnlocked(value, this.progressionLevel));
    let type = pickWeighted(availableWeights);

    if (
      this.lastSpawnedType &&
      this.lastSpawnStreak < ENEMY_TYPE_REPEAT_MAX_STREAK &&
      Math.random() < ENEMY_TYPE_REPEAT_CHANCE &&
      availableWeights.some(({ value }) => value === this.lastSpawnedType)
    ) {
      type = this.lastSpawnedType;
    }

    if (type === this.lastSpawnedType) {
      this.lastSpawnStreak += 1;
    } else {
      this.lastSpawnedType = type;
      this.lastSpawnStreak = 1;
    }

    const enemy = new Enemy(
      this.scene,
      randomBetween(36, GAME_WIDTH - 36),
      ENEMY_ENTRY_Y,
      type,
      this.difficultyManager.getEnemySpeedMultiplier(),
    );

    this.group.add(enemy);
  }

  private getAdaptiveSpawnIntervalMs(): number {
    const requirements = getGateRequirements(this.progressionLevel);
    const requiredKills = requirements.small + requirements.medium + requirements.heavy;
    const targetDurationMs = Math.min(
      MAX_LEVEL_DURATION_MS,
      MIN_LEVEL_DURATION_MS + (this.progressionLevel - 1) * LEVEL_DURATION_STEP_MS,
    );

    const requiredSpawnCount = requiredKills / (KILL_EFFICIENCY * OBJECTIVE_TYPE_SPAWN_SHARE);
    const baseIntervalMs = targetDurationMs / Math.max(1, requiredSpawnCount);
    const levelProgress = Phaser.Math.Clamp(this.levelElapsedMs / targetDurationMs, 0, 1);
    const rampFactor = Phaser.Math.Linear(START_RAMP_FACTOR, END_RAMP_FACTOR, levelProgress);
    const rampedIntervalMs = baseIntervalMs * rampFactor;

    return Phaser.Math.Clamp(rampedIntervalMs, MIN_SPAWN_INTERVAL_MS, MAX_SPAWN_INTERVAL_MS);
  }
}
