import type { EnemyType } from '../utils/Constants';

/** Seconds of survival required before each boss level spawns. */
export const getBossSpawnTimeMs = (level: number): number =>
  (60 + (level - 1) * 10) * 1_000; // 60s → 150s across 10 levels

export const getBossHpScale = (level: number): number => {
  if (level <= 5) return 1 + (level - 1) * 0.16;
  const levelFiveScale = 1 + 4 * 0.16;
  return levelFiveScale + (level - 5) * 0.10;
};

// ── Kept for DailyChallengeManager enemy-kill tracking ────────────────────
export type BossObjectiveEnemyType = 'small' | 'medium' | 'heavy';
export const isBossObjectiveEnemy = (type: EnemyType): type is BossObjectiveEnemyType =>
  type === 'small' || type === 'medium' || type === 'heavy';
