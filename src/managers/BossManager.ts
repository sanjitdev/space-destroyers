import Phaser from 'phaser';
import { Boss } from '../entities/Boss';
import { BOSS_LEVEL_CONFIGS } from '../utils/Constants';
import { getBossHpScale, getBossSpawnTimeMs } from './BossProgression';

export class BossManager {
  private boss: Boss | null = null;
  private nextLevelIndex = 0;
  private enterTween: Phaser.Tweens.Tween | null = null;
  private readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  getBoss(): Boss | null {
    return this.boss?.active ? this.boss : null;
  }

  /**
   * Call every update with the time elapsed since this level started.
   * Returns true when a new boss spawns.
   */
  checkSpawn(levelElapsedMs: number): boolean {
    if (this.boss?.active) return false;
    if (this.nextLevelIndex >= BOSS_LEVEL_CONFIGS.length) return false;

    const cfg = BOSS_LEVEL_CONFIGS[this.nextLevelIndex];
    if (levelElapsedMs < getBossSpawnTimeMs(cfg.level)) return false;

    this.nextLevelIndex++;
    this.spawnBoss(cfg.level - 1);
    return true;
  }

  /** 0–1 fill fraction: how close we are to boss spawn. */
  getBossTimeFraction(levelElapsedMs: number): number {
    if (this.nextLevelIndex >= BOSS_LEVEL_CONFIGS.length) return 1;
    const threshold = getBossSpawnTimeMs(BOSS_LEVEL_CONFIGS[this.nextLevelIndex].level);
    return Math.min(1, levelElapsedMs / threshold);
  }

  /** Whole seconds remaining before the next boss spawns (0 if already spawning). */
  getTimeRemainingSeconds(levelElapsedMs: number): number {
    if (this.nextLevelIndex >= BOSS_LEVEL_CONFIGS.length) return 0;
    const threshold = getBossSpawnTimeMs(BOSS_LEVEL_CONFIGS[this.nextLevelIndex].level);
    return Math.max(0, Math.ceil((threshold - levelElapsedMs) / 1_000));
  }

  getBossesDefeated(): number {
    return this.nextLevelIndex - (this.boss?.active ? 1 : 0);
  }

  destroyBoss(): void {
    this.enterTween?.stop();
    this.boss?.destroy();
    this.boss = null;
  }

  getNextBossLevel(): number | null {
    if (this.nextLevelIndex >= BOSS_LEVEL_CONFIGS.length) return null;
    return BOSS_LEVEL_CONFIGS[this.nextLevelIndex].level;
  }

  getActiveBossName(): string {
    return this.boss?.getName() ?? '';
  }

  getActiveBossLevel(): number {
    return this.boss?.getLevel() ?? 0;
  }

  private spawnBoss(configIndex: number): void {
    const cfg = BOSS_LEVEL_CONFIGS[configIndex];
    const hpScale = getBossHpScale(cfg.level);
    const scaledConfig = {
      ...cfg,
      maxHp: Math.round(cfg.maxHp * hpScale),
      phase2Hp: Math.round(cfg.phase2Hp * hpScale),
    };
    this.boss = new Boss(this.scene, scaledConfig);

    this.enterTween = this.scene.tweens.add({
      targets: this.boss,
      y: 240,
      duration: 1_800,
      ease: 'Back.easeOut',
    });
  }
}
