import Phaser from 'phaser';
import { Boss } from '../entities/Boss';
import { DIFFICULTY_STEP_MS } from '../utils/Constants';

// Bosses arrive after stage 1, 2, 3 … (i.e. at 20s, 40s, 60s…)
const BOSS_SPAWN_STAGES = [1, 2, 3, 4, 5] as const;

export class BossManager {
  private boss: Boss | null = null;
  private lastBossStage = -1;
  private readonly scene: Phaser.Scene;
  private enterTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Called each update. Returns the live Boss if one is active, or null. */
  getBoss(): Boss | null {
    return this.boss?.active ? this.boss : null;
  }

  /** Spawn a boss when a new qualifying stage is reached. */
  checkSpawn(elapsedMs: number): boolean {
    if (this.boss?.active) return false;

    const stage = Math.floor(elapsedMs / DIFFICULTY_STEP_MS);
    if (
      BOSS_SPAWN_STAGES.includes(stage as typeof BOSS_SPAWN_STAGES[number]) &&
      stage !== this.lastBossStage
    ) {
      this.lastBossStage = stage;
      this.spawnBoss();
      return true;
    }
    return false;
  }

  destroyBoss(): void {
    this.enterTween?.stop();
    this.boss?.destroy();
    this.boss = null;
  }

  private spawnBoss(): void {
    this.boss = new Boss(this.scene);

    // Slide boss in from above
    this.enterTween = this.scene.tweens.add({
      targets: this.boss,
      y: 90,
      duration: 1_800,
      ease: 'Back.easeOut',
    });
  }
}
