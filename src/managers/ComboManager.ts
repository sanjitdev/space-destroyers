const COMBO_RESET_MS = 3_000;
const COMBO_THRESHOLDS = [5, 10, 20, 40] as const;

export class ComboManager {
  private count = 0;
  private idleMs = 0;

  get multiplier(): number {
    if (this.count >= 40) return 5;
    if (this.count >= 20) return 4;
    if (this.count >= 10) return 3;
    if (this.count >= 5)  return 2;
    return 1;
  }

  get streak(): number {
    return this.count;
  }

  update(deltaMs: number): void {
    if (this.count === 0) return;
    this.idleMs += deltaMs;
    if (this.idleMs >= COMBO_RESET_MS) {
      this.count = 0;
      this.idleMs = 0;
    }
  }

  onKill(): void {
    this.count += 1;
    this.idleMs = 0;
  }

  onDamage(): void {
    this.count = 0;
    this.idleMs = 0;
  }

  /** Returns the threshold just crossed if a new tier was reached, else null. */
  crossedThreshold(): number | null {
    for (const t of COMBO_THRESHOLDS) {
      if (this.count === t) return t;
    }
    return null;
  }

  apply(basePoints: number, scoreDoubled: boolean): number {
    return basePoints * this.multiplier * (scoreDoubled ? 2 : 1);
  }
}
