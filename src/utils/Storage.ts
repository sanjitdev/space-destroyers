const HIGH_SCORE_KEY = 'space-destroyers-high-score';
const MUTED_KEY = 'space-destroyers-muted';

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
};
