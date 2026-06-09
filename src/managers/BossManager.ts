import Phaser from 'phaser';
import { Boss } from '../entities/Boss';
import { BOSS_LEVEL_CONFIGS, type EnemyType } from '../utils/Constants';

export type BossObjectiveEnemyType = 'small' | 'medium' | 'heavy';

type EnemyKillProgress = Record<BossObjectiveEnemyType, number>;

const EMPTY_PROGRESS = (): EnemyKillProgress => ({ small: 0, medium: 0, heavy: 0 });

const FIRST_BOSS_SMALL_KILLS = 14;
const FIRST_BOSS_MEDIUM_KILLS = 4;
const FIRST_BOSS_HEAVY_KILLS = 0;

const getGateRequirements = (level: number): EnemyKillProgress => ({
  small: level === 1 ? FIRST_BOSS_SMALL_KILLS : level <= 3 ? 6 + level * 2 : 10 + level * 2,
  medium: level === 1 ? FIRST_BOSS_MEDIUM_KILLS : level <= 3 ? 1 + level : 3 + Math.floor(level * 1.4),
  heavy: level === 1 ? FIRST_BOSS_HEAVY_KILLS : level <= 4 ? 1 : 1 + Math.floor((level - 1) / 3),
});

const isBossObjectiveEnemy = (type: EnemyType): type is BossObjectiveEnemyType =>
  type === 'small' || type === 'medium' || type === 'heavy';

const getBossHpScale = (level: number): number => {
  if (level <= 5) return 1 + (level - 1) * 0.16;
  const levelFiveScale = 1 + 4 * 0.16;
  return levelFiveScale + (level - 5) * 0.10;
};

export class BossManager {
  private boss: Boss | null = null;
  private nextLevelIndex = 0;       // which BOSS_LEVEL_CONFIGS entry fires next
  private enterTween: Phaser.Tweens.Tween | null = null;
  private readonly scene: Phaser.Scene;
  private gateProgress: EnemyKillProgress = EMPTY_PROGRESS();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Returns the live boss if one is on screen, otherwise null. */
  getBoss(): Boss | null {
    return this.boss?.active ? this.boss : null;
  }

  /**
   * Call every update to check whether the current level gate is complete.
   * Returns true when a new boss is spawned.
   */
  checkSpawn(): boolean {
    if (this.boss?.active) return false;
    if (this.nextLevelIndex >= BOSS_LEVEL_CONFIGS.length) return false;

    const cfg = BOSS_LEVEL_CONFIGS[this.nextLevelIndex];
    const required = getGateRequirements(cfg.level);
    if (
      this.gateProgress.small < required.small ||
      this.gateProgress.medium < required.medium ||
      this.gateProgress.heavy < required.heavy
    ) {
      return false;
    }

    this.nextLevelIndex++;
    this.gateProgress = EMPTY_PROGRESS();
    this.spawnBoss(cfg.level - 1);
    return true;
  }

  onEnemyKilled(type: EnemyType): void {
    if (this.boss?.active) return;
    if (!isBossObjectiveEnemy(type)) return;
    this.gateProgress[type] += 1;
  }

  getCurrentGateRequirements(): EnemyKillProgress | null {
    if (this.nextLevelIndex >= BOSS_LEVEL_CONFIGS.length) return null;
    return getGateRequirements(BOSS_LEVEL_CONFIGS[this.nextLevelIndex].level);
  }

  getCurrentGateProgress(): EnemyKillProgress | null {
    if (this.nextLevelIndex >= BOSS_LEVEL_CONFIGS.length) return null;
    return { ...this.gateProgress };
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
