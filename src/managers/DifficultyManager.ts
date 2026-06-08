import { DIFFICULTY_STEP_MS, type EnemyType } from '../utils/Constants';

export class DifficultyManager {
  private stage = 0;

  update(elapsedMs: number): void {
    this.stage = Math.floor(elapsedMs / DIFFICULTY_STEP_MS);
  }

  getSpawnIntervalMs(): number {
    return Math.max(320, 920 - this.stage * 110);
  }

  getEnemySpeedMultiplier(): number {
    return 1 + this.stage * 0.18;
  }

  getEnemyWeights(): Array<{ value: EnemyType; weight: number }> {
    return [
      { value: 'small', weight: Math.max(16, 76 - this.stage * 8) },
      { value: 'medium', weight: Math.min(46, 18 + this.stage * 6) },
      { value: 'heavy', weight: Math.min(30, 6 + this.stage * 4) },
    ];
  }
}
