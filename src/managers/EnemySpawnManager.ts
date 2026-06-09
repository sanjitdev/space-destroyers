import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { GAME_WIDTH, type EnemyType } from '../utils/Constants';
import { DifficultyManager } from './DifficultyManager';
import { pickWeighted, randomBetween } from '../utils/Random';

const FORMATION_INTERVAL_MS = 12_000;
const ENEMY_ENTRY_Y = 190;

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
  private readonly scene: Phaser.Scene;
  private readonly group: Phaser.Physics.Arcade.Group;
  private readonly difficultyManager: DifficultyManager;

  constructor(scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group, difficultyManager: DifficultyManager) {
    this.scene = scene;
    this.group = group;
    this.difficultyManager = difficultyManager;
  }

  update(deltaMs: number): void {
    this.cooldownMs -= deltaMs;
    while (this.cooldownMs <= 0) {
      this.spawnEnemy();
      this.cooldownMs += this.difficultyManager.getSpawnIntervalMs();
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
    this.cooldownMs = 400;
    this.formationCooldownMs = FORMATION_INTERVAL_MS;
  }

  private spawnEnemy(): void {
    const availableWeights = this.difficultyManager
      .getEnemyWeights()
      .filter(({ value, weight }) => weight > 0 && isTypeUnlocked(value, this.progressionLevel));
    const type = pickWeighted(availableWeights);
    const enemy = new Enemy(
      this.scene,
      randomBetween(36, GAME_WIDTH - 36),
      ENEMY_ENTRY_Y,
      type,
      this.difficultyManager.getEnemySpeedMultiplier(),
    );

    this.group.add(enemy);
  }
}
