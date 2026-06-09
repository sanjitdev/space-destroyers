import type { EnemyType } from '../utils/Constants';

export type BossObjectiveEnemyType = 'small' | 'medium' | 'heavy';

export type EnemyKillProgress = Record<BossObjectiveEnemyType, number>;

export const EMPTY_PROGRESS = (): EnemyKillProgress => ({ small: 0, medium: 0, heavy: 0 });

export const FIRST_BOSS_SMALL_KILLS = 20;
export const FIRST_BOSS_MEDIUM_KILLS = 10;
export const FIRST_BOSS_HEAVY_KILLS = 5;

export const getGateRequirements = (level: number): EnemyKillProgress => ({
  small: FIRST_BOSS_SMALL_KILLS + (level - 1) * 4,
  medium: FIRST_BOSS_MEDIUM_KILLS + (level - 1) * 3,
  heavy: FIRST_BOSS_HEAVY_KILLS + (level - 1),
});

export const isBossObjectiveEnemy = (type: EnemyType): type is BossObjectiveEnemyType =>
  type === 'small' || type === 'medium' || type === 'heavy';

export const getBossHpScale = (level: number): number => {
  if (level <= 5) return 1 + (level - 1) * 0.16;
  const levelFiveScale = 1 + 4 * 0.16;
  return levelFiveScale + (level - 5) * 0.10;
};
