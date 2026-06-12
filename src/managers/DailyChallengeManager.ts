import { Storage } from '../utils/Storage';
import { type ChallengeDef, type EnemyType } from '../utils/Constants';

/** Seeded pseudo-random using a date string as seed (xorshift). */
function seededRandom(seed: string): () => number {
  let s = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) | 0;
  return () => {
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    return (s >>> 0) / 0xffffffff;
  };
}

const CHALLENGE_POOL: ReadonlyArray<Omit<ChallengeDef, 'target'> & { targetFn: (rng: () => number) => number }> = [
  { type: 'kill_type', label: 'Small Enemy Hunter', targetFn: r => Math.floor(r() * 20 + 30), param: 'small' },
  { type: 'kill_type', label: 'Medium Enemy Hunter', targetFn: r => Math.floor(r() * 15 + 15), param: 'medium' },
  { type: 'kill_type', label: 'Heavy Destroyer',    targetFn: r => Math.floor(r() * 8 + 5),   param: 'heavy' },
  { type: 'kill_type', label: 'Striker Slayer',     targetFn: r => Math.floor(r() * 10 + 5),  param: 'striker' },
  { type: 'score',     label: 'Score Attack',        targetFn: r => (Math.floor(r() * 5) + 2) * 500 },
  { type: 'score',     label: 'High Scorer',         targetFn: r => (Math.floor(r() * 6) + 4) * 1000 },
  { type: 'survive',   label: 'Survivor',            targetFn: r => Math.floor(r() * 20 + 30) },
  { type: 'combo',     label: 'Combo King',          targetFn: r => Math.floor(r() * 3 + 2) },
  { type: 'defeat_boss', label: 'Boss Buster',       targetFn: () => 1 },
  { type: 'no_damage', label: 'Untouchable',         targetFn: () => 1 },
  { type: 'use_powerup', label: 'Power Player',      targetFn: () => 1, param: 'laser' },
  { type: 'use_powerup', label: 'Shield Wall',       targetFn: () => 1, param: 'shield' },
];

const TODAY_KEY_FORMAT = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const REWARD_MULT_PER_CHALLENGE = 0.10;

export interface ChallengeState {
  readonly def: ChallengeDef;
  progress: number;
  completed: boolean;
}

export class DailyChallengeManager {
  private readonly challenges: ChallengeState[];
  private readonly today: string;

  constructor() {
    this.today = TODAY_KEY_FORMAT();
    this.challenges = this.loadOrGenerate();
  }

  private loadOrGenerate(): ChallengeState[] {
    const stored = Storage.getDailyChallenge();
    if (stored && stored.date === this.today) {
      const defs = this.generateDefs();
      return defs.map((def, i) => ({
        def,
        progress: stored.progress[i] ?? 0,
        completed: stored.completed[i] ?? false,
      }));
    }
    const defs = this.generateDefs();
    return defs.map(def => ({ def, progress: 0, completed: false }));
  }

  private generateDefs(): ChallengeDef[] {
    const rng = seededRandom(this.today);
    const shuffled = [...CHALLENGE_POOL].sort(() => rng() - 0.5);
    return shuffled.slice(0, 3).map(template => ({
      type: template.type,
      label: template.label,
      target: template.targetFn(rng),
      param: template.param,
    }));
  }

  getChallenges(): readonly ChallengeState[] {
    return this.challenges;
  }

  /** Record a kill of a specific enemy type. */
  onEnemyKilled(type: EnemyType): void {
    for (const state of this.challenges) {
      if (state.completed) continue;
      if (state.def.type === 'kill_type' && state.def.param === type) {
        state.progress += 1;
        this.checkComplete(state);
      }
    }
    this.save();
  }

  onSurviveSecond(): void {
    for (const state of this.challenges) {
      if (state.completed) continue;
      if (state.def.type === 'survive') {
        state.progress += 1;
        this.checkComplete(state);
      }
    }
    this.save();
  }

  onScoreReached(score: number): void {
    for (const state of this.challenges) {
      if (state.completed) continue;
      if (state.def.type === 'score') {
        state.progress = Math.max(state.progress, score);
        this.checkComplete(state);
      }
    }
    this.save();
  }

  onComboReached(multiplier: number): void {
    for (const state of this.challenges) {
      if (state.completed) continue;
      if (state.def.type === 'combo') {
        state.progress = Math.max(state.progress, multiplier);
        this.checkComplete(state);
      }
    }
    this.save();
  }

  onBossDefeated(): void {
    for (const state of this.challenges) {
      if (state.completed) continue;
      if (state.def.type === 'defeat_boss') {
        state.progress += 1;
        this.checkComplete(state);
      }
    }
    this.save();
  }

  onNoDamageRun(): void {
    for (const state of this.challenges) {
      if (state.completed) continue;
      if (state.def.type === 'no_damage') {
        state.progress = 1;
        this.checkComplete(state);
      }
    }
    this.save();
  }

  onPowerUpUsed(type: string): void {
    for (const state of this.challenges) {
      if (state.completed) continue;
      if (state.def.type === 'use_powerup' && state.def.param === type) {
        state.progress = 1;
        this.checkComplete(state);
      }
    }
    this.save();
  }

  /** Returns the score multiplier bonus (1.0 = no bonus; 1.3 = 30% bonus). */
  getScoreMultiplierBonus(): number {
    const completedCount = this.challenges.filter(c => c.completed).length;
    return 1 + completedCount * REWARD_MULT_PER_CHALLENGE;
  }

  private checkComplete(state: ChallengeState): void {
    if (state.progress >= state.def.target) {
      state.completed = true;
    }
  }

  private save(): void {
    Storage.setDailyChallenge({
      date: this.today,
      progress: this.challenges.map(c => c.progress),
      completed: this.challenges.map(c => c.completed),
    });
  }
}
