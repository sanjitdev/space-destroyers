import { GAME_DURATION_MS } from '../utils/Constants';

export class TimerManager {
  private remainingMs: number;
  private elapsedMs = 0;
  private readonly infinite: boolean;

  constructor(durationMs = GAME_DURATION_MS, infinite = false) {
    this.infinite = infinite;
    this.remainingMs = durationMs;
  }

  update(deltaMs: number): void {
    this.elapsedMs += deltaMs;
    if (!this.infinite) {
      this.remainingMs = Math.max(0, this.remainingMs - deltaMs);
    }
  }

  getRemainingMs(): number {
    return this.remainingMs;
  }

  /** Returns -1 in infinite mode; otherwise seconds remaining (ceiling). */
  getRemainingSeconds(): number {
    return this.infinite ? -1 : Math.ceil(this.remainingMs / 1000);
  }

  getElapsedMs(): number {
    return this.elapsedMs;
  }

  isComplete(): boolean {
    return !this.infinite && this.remainingMs <= 0;
  }
}
