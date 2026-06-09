import type { EnemyType } from '../utils/Constants';

export type BossObjectiveEnemyType = 'small' | 'medium' | 'heavy';

export type EnemyKillProgress = Record<BossObjectiveEnemyType, number>;

export const EMPTY_PROGRESS = (): EnemyKillProgress => ({ small: 0, medium: 0, heavy: 0 });

export const FIRST_BOSS_SMALL_KILLS = 14;
export const FIRST_BOSS_MEDIUM_KILLS = 4;
export const FIRST_BOSS_HEAVY_KILLS = 0;

export const getGateRequirements = (level: number): EnemyKillProgress => ({
  small: level === 1 ? FIRST_BOSS_SMALL_KILLS : level <= 3 ? 6 + level * 2 : 10 + level * 2,
  medium: level === 1 ? FIRST_BOSS_MEDIUM_KILLS : level <= 3 ? 1 + level : 3 + Math.floor(level * 1.4),
  heavy: level === 1 ? FIRST_BOSS_HEAVY_KILLS : level <= 4 ? 1 : 1 + Math.floor((level - 1) / 3),
});

export const isBossObjectiveEnemy = (type: EnemyType): type is BossObjectiveEnemyType =>
  type === 'small' || type === 'medium' || type === 'heavy';

export const getBossHpScale = (level: number): number => {
  if (level <= 5) return 1 + (level - 1) * 0.16;
  const levelFiveScale = 1 + 4 * 0.16;
  return levelFiveScale + (level - 5) * 0.10;
};
