import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { GAME_WIDTH } from '../utils/Constants';
import { DifficultyManager } from './DifficultyManager';
import { pickWeighted, randomBetween } from '../utils/Random';

export class EnemySpawnManager {
  private cooldownMs = 250;
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
