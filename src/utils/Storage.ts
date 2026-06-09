import { DIFFICULTY_IDS, SHIP_CONFIGS, THEME_IDS, type DifficultyId, type ThemeId } from './Constants';

const HIGH_SCORE_KEY = 'space-destroyers-high-score';
const MUTED_KEY = 'space-destroyers-muted';
const THEME_KEY = 'space-destroyers-theme';
const SHIP_KEY = 'space-destroyers-ship';
const SHIP_LEVEL_KEY = 'space-destroyers-ship-level';
const DIFFICULTY_KEY = 'space-destroyers-difficulty';
const GAMES_PLAYED_KEY = 'space-destroyers-games-played';
const TOTAL_KILLS_KEY = 'space-destroyers-total-kills';
const TOTAL_BOSSES_KEY = 'space-destroyers-total-bosses';
const SHIP_BEST_KEY = (idx: number) => `space-destroyers-ship-best-${idx}`;
const TUTORIAL_KEY = 'space-destroyers-tutorial-done';

const withStorage = <T>(fallback: T, action: () => T): T => {
  try {
    return action();
  } catch {
    return fallback;
  }
};

export const Storage = {
  getHighScore(): number {
    return withStorage(0, () => Number.parseInt(window.localStorage.getItem(HIGH_SCORE_KEY) ?? '0', 10) || 0);
  },
  setHighScore(score: number): void {
    withStorage(undefined, () => {
      window.localStorage.setItem(HIGH_SCORE_KEY, String(score));
      return undefined;
    });
  },
  getMuted(): boolean {
    return withStorage(false, () => window.localStorage.getItem(MUTED_KEY) === 'true');
  },
  setMuted(muted: boolean): void {
    withStorage(undefined, () => {
      window.localStorage.setItem(MUTED_KEY, String(muted));
      return undefined;
    });
  },
  getTheme(): ThemeId {
    return withStorage<ThemeId>('blue', () => {
      const stored = window.localStorage.getItem(THEME_KEY);
      return (THEME_IDS as readonly string[]).includes(stored ?? '') ? (stored as ThemeId) : 'blue';
    });
  },
  setTheme(theme: ThemeId): void {
    withStorage(undefined, () => {
      window.localStorage.setItem(THEME_KEY, theme);
      return undefined;
    });
  },
  getSelectedShipIndex(): number {
    return withStorage(0, () => {
      const idx = Number.parseInt(window.localStorage.getItem(SHIP_KEY) ?? '0', 10);
      return Number.isFinite(idx) && idx >= 0 && idx < SHIP_CONFIGS.length ? idx : 0;
    });
  },
  setSelectedShipIndex(index: number): void {
    withStorage(undefined, () => {
      window.localStorage.setItem(SHIP_KEY, String(index));
      return undefined;
    });
  },

  getMaxUnlockedShipLevel(): number {
    return withStorage(1, () => {
      const stored = Number.parseInt(window.localStorage.getItem(SHIP_LEVEL_KEY) ?? '1', 10);
      if (!Number.isFinite(stored)) return 1;
      return Math.min(SHIP_CONFIGS.length, Math.max(1, stored));
    });
  },
  unlockShipLevel(level: number): void {
    withStorage(undefined, () => {
      const clampedLevel = Math.min(SHIP_CONFIGS.length, Math.max(1, level));
      const current = this.getMaxUnlockedShipLevel();
      if (clampedLevel > current) {
        window.localStorage.setItem(SHIP_LEVEL_KEY, String(clampedLevel));
      }
      return undefined;
    });
  },

  getDifficulty(): DifficultyId {
    return withStorage<DifficultyId>('normal', () => {
      const stored = window.localStorage.getItem(DIFFICULTY_KEY);
      return (DIFFICULTY_IDS as readonly string[]).includes(stored ?? '') ? (stored as DifficultyId) : 'normal';
    });
  },
  setDifficulty(difficulty: DifficultyId): void {
    withStorage(undefined, () => {
      window.localStorage.setItem(DIFFICULTY_KEY, difficulty);
      return undefined;
    });
  },

  getGamesPlayed(): number {
    return withStorage(0, () => Number.parseInt(window.localStorage.getItem(GAMES_PLAYED_KEY) ?? '0', 10) || 0);
  },
  incrementGamesPlayed(): void {
    withStorage(undefined, () => {
      window.localStorage.setItem(GAMES_PLAYED_KEY, String(this.getGamesPlayed() + 1));
      return undefined;
    });
  },

  getTotalKills(): number {
    return withStorage(0, () => Number.parseInt(window.localStorage.getItem(TOTAL_KILLS_KEY) ?? '0', 10) || 0);
  },
  addKills(count: number): void {
    withStorage(undefined, () => {
      window.localStorage.setItem(TOTAL_KILLS_KEY, String(this.getTotalKills() + count));
      return undefined;
    });
  },

  getTotalBossesKilled(): number {
    return withStorage(0, () => Number.parseInt(window.localStorage.getItem(TOTAL_BOSSES_KEY) ?? '0', 10) || 0);
  },
  addBossKills(count: number): void {
    withStorage(undefined, () => {
      window.localStorage.setItem(TOTAL_BOSSES_KEY, String(this.getTotalBossesKilled() + count));
      return undefined;
    });
  },

  getShipBest(shipIndex: number): number {
    return withStorage(0, () => Number.parseInt(window.localStorage.getItem(SHIP_BEST_KEY(shipIndex)) ?? '0', 10) || 0);
  },
  updateShipBest(shipIndex: number, score: number): void {
    withStorage(undefined, () => {
      const current = this.getShipBest(shipIndex);
      if (score > current) window.localStorage.setItem(SHIP_BEST_KEY(shipIndex), String(score));
      return undefined;
    });
  },

  hasDoneTutorial(): boolean {
    return withStorage(false, () => window.localStorage.getItem(TUTORIAL_KEY) === 'true');
  },
  markTutorialDone(): void {
    withStorage(undefined, () => {
      window.localStorage.setItem(TUTORIAL_KEY, 'true');
      return undefined;
    });
  },
};
