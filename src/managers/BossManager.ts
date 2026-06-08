import Phaser from 'phaser';
import { Boss } from '../entities/Boss';
import { BOSS_LEVEL_CONFIGS } from '../utils/Constants';

export class BossManager {
  private boss: Boss | null = null;
  private nextLevelIndex = 0;       // which BOSS_LEVEL_CONFIGS entry fires next
  private enterTween: Phaser.Tweens.Tween | null = null;
  private readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Returns the live boss if one is on screen, otherwise null. */
  getBoss(): Boss | null {
    return this.boss?.active ? this.boss : null;
  }

  /**
   * Call every update with the player's total kill count.
   * Returns true when a new boss is spawned.
   */
  checkSpawn(totalKills: number): boolean {
    if (this.boss?.active) return false;
    if (this.nextLevelIndex >= BOSS_LEVEL_CONFIGS.length) return false;

    const cfg = BOSS_LEVEL_CONFIGS[this.nextLevelIndex];
    if (totalKills < cfg.killsRequired) return false;

    this.nextLevelIndex++;
    this.spawnBoss(cfg.level - 1);
    return true;
  }

  getActiveBossName(): string {
    return this.boss?.getName() ?? '';
  }

  getActiveBossLevel(): number {
    return this.boss?.getLevel() ?? 0;
  }

  /** Kills remaining bosses already on screen count toward next boss */
  getBossesDefeated(): number {
    return this.nextLevelIndex - (this.boss?.active ? 1 : 0);
  }

  destroyBoss(): void {
    this.enterTween?.stop();
    this.boss?.destroy();
    this.boss = null;
  }

  private spawnBoss(configIndex: number): void {
    const cfg = BOSS_LEVEL_CONFIGS[configIndex];
    this.boss = new Boss(this.scene, cfg);

    this.enterTween = this.scene.tweens.add({
      targets: this.boss,
      y: 240,
      duration: 1_800,
      ease: 'Back.easeOut',
    });
  }
}
