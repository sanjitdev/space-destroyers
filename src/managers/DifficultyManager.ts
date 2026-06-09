import { DIFFICULTY_STEP_MS, type EnemyType } from '../utils/Constants';
import { DIFFICULTY_PRESETS, type DifficultyId } from '../utils/Constants';

export class DifficultyManager {
  private stage = 0;
  private readonly preset;

  constructor(difficulty: DifficultyId = 'normal') {
    this.preset = DIFFICULTY_PRESETS[difficulty];
  }

  update(elapsedMs: number): void {
    this.stage = Math.floor(elapsedMs / DIFFICULTY_STEP_MS);
  }

  getSpawnIntervalMs(): number {
    const baseIntervalMs = Math.max(320, 920 - this.stage * 110);
    return Math.max(260, Math.round(baseIntervalMs * this.preset.spawnIntervalScale));
  }

  getEnemySpeedMultiplier(): number {
    return this.preset.speedScale;
  }

  getEnemyWeights(): Array<{ value: EnemyType; weight: number }> {
    return [
      { value: 'small', weight: Math.max(16, 76 - this.stage * 8) },
      { value: 'medium', weight: Math.min(46, 18 + this.stage * 6) },
      { value: 'heavy', weight: this.stage >= 2 ? 7 : 3 },
      { value: 'striker', weight: this.stage >= 2 ? Math.min(36, 8 + (this.stage - 2) * 7) : 0 },
      { value: 'bomber', weight: this.stage >= 4 ? 9 : 0 },
      { value: 'destroyer', weight: this.stage >= 6 ? 6 : 0 },
    ];
  }
}
