import { SHIP_CONFIGS, THEME_IDS, type ThemeId } from './Constants';

const HIGH_SCORE_KEY = 'space-destroyers-high-score';
const MUTED_KEY = 'space-destroyers-muted';
const THEME_KEY = 'space-destroyers-theme';
const SHIP_KEY = 'space-destroyers-ship';

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
};
