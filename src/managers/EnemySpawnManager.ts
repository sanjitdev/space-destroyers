import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { GAME_WIDTH } from '../utils/Constants';
import { DifficultyManager } from './DifficultyManager';
import { pickWeighted, randomBetween } from '../utils/Random';

const FORMATION_INTERVAL_MS = 12_000;

type FormationFn = (scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group, speedMult: number) => void;

const spawnAt = (scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group, x: number, y: number, speedMult: number, delayMs: number): void => {
  scene.time.delayedCall(delayMs, () => {
    group.add(new Enemy(scene, x, y, 'small', speedMult));
  });
};

const FORMATIONS: FormationFn[] = [
  // V-shape: 5 enemies
  (scene, group, mult) => {
    const cx = GAME_WIDTH / 2;
    const pts = [
      { x: cx,      y: -20 },
      { x: cx - 60, y: -52 },
      { x: cx + 60, y: -52 },
      { x: cx - 120, y: -84 },
      { x: cx + 120, y: -84 },
    ];
    pts.forEach(({ x, y }, i) => spawnAt(scene, group, x, y, mult, i * 60));
  },
  // Grid: 2 rows × 4 cols
  (scene, group, mult) => {
    const startX = GAME_WIDTH / 2 - 90;
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        spawnAt(scene, group, startX + col * 60, -20 - row * 48, mult, (row * 4 + col) * 70);
      }
    }
  },
  // Diagonal sweep: 6 enemies from left to right
  (scene, group, mult) => {
    for (let i = 0; i < 6; i++) {
      spawnAt(scene, group, 48 + i * 72, -20 - i * 36, mult, i * 100);
    }
  },
];

export class EnemySpawnManager {
  private cooldownMs = 250;
  private formationCooldownMs = FORMATION_INTERVAL_MS;
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
      fn(this.scene, this.group, this.difficultyManager.getEnemySpeedMultiplier());
      this.formationCooldownMs = FORMATION_INTERVAL_MS;
    }
  }

  private spawnEnemy(): void {
    const type = pickWeighted(this.difficultyManager.getEnemyWeights());
    const enemy = new Enemy(
      this.scene,
      randomBetween(36, GAME_WIDTH - 36),
      -32,
      type,
      this.difficultyManager.getEnemySpeedMultiplier(),
    );

    this.group.add(enemy);
  }
}
