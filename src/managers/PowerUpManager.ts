import { POWER_UP_DROP_CHANCE, POWER_UP_DURATION_MS, POWER_UP_LABELS, POWER_UP_TYPES, type PowerUpType } from '../utils/Constants';
import { chance, pickOne } from '../utils/Random';

export class PowerUpManager {
  private readonly activePowerUps = new Map<PowerUpType, number>();

  update(deltaMs: number): void {
    for (const [type, remainingMs] of this.activePowerUps.entries()) {
      const updated = remainingMs - deltaMs;
      if (updated <= 0) {
        this.activePowerUps.delete(type);
      } else {
        this.activePowerUps.set(type, updated);
      }
    }
  }

  activate(type: PowerUpType): void {
    this.activePowerUps.set(type, POWER_UP_DURATION_MS);
  }

  isActive(type: PowerUpType): boolean {
    return this.activePowerUps.has(type);
  }

  getActiveTypes(): PowerUpType[] {
    return Array.from(this.activePowerUps.keys());
  }

  getDisplayItems(): string[] {
    return this.getActiveTypes().map((type) => `${POWER_UP_LABELS[type]} ${Math.ceil((this.activePowerUps.get(type) ?? 0) / 1000)}s`);
  }

  shouldDrop(): boolean {
    return chance(POWER_UP_DROP_CHANCE);
  }

  getRandomType(): PowerUpType {
    return pickOne(POWER_UP_TYPES);
  }
}
