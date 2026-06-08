import { GAME_DURATION_MS } from '../utils/Constants';

export class TimerManager {
  private readonly durationMs: number;
  private remainingMs: number;

  constructor(durationMs = GAME_DURATION_MS) {
    this.durationMs = durationMs;
    this.remainingMs = durationMs;
  }

  update(deltaMs: number): void {
    this.remainingMs = Math.max(0, this.remainingMs - deltaMs);
  }

  getRemainingMs(): number {
    return this.remainingMs;
  }

  getRemainingSeconds(): number {
    return Math.ceil(this.remainingMs / 1000);
  }

  getElapsedMs(): number {
    return this.durationMs - this.remainingMs;
  }

  isComplete(): boolean {
    return this.remainingMs <= 0;
  }
}
