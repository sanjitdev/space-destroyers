import { describe, expect, it } from 'vitest';
import {
  FIRST_BOSS_HEAVY_KILLS,
  FIRST_BOSS_MEDIUM_KILLS,
  FIRST_BOSS_SMALL_KILLS,
  getBossHpScale,
  getGateRequirements,
} from '../src/managers/BossProgression';

describe('BossProgression', () => {
  it('uses tuned first-boss kill gate requirements', () => {
    const requirements = getGateRequirements(1);
    expect(requirements.small).toBe(FIRST_BOSS_SMALL_KILLS);
    expect(requirements.medium).toBe(FIRST_BOSS_MEDIUM_KILLS);
    expect(requirements.heavy).toBe(FIRST_BOSS_HEAVY_KILLS);
  });

  it('scales gate requirements upward by level', () => {
    const levelThree = getGateRequirements(3);
    const levelEight = getGateRequirements(8);

    expect(levelEight.small).toBeGreaterThan(levelThree.small);
    expect(levelEight.medium).toBeGreaterThan(levelThree.medium);
    expect(levelEight.heavy).toBeGreaterThanOrEqual(levelThree.heavy);
  });

  it('ramps boss hp aggressively through level 5 then linearly', () => {
    expect(getBossHpScale(1)).toBeCloseTo(1);
    expect(getBossHpScale(5)).toBeCloseTo(1.64);
    expect(getBossHpScale(6)).toBeCloseTo(1.74);
    expect(getBossHpScale(10)).toBeCloseTo(2.14);
  });
});
