import { POWER_UP_DROP_CHANCE, POWER_UP_DURATION_MS, POWER_UP_LABELS, POWER_UP_TYPES, POWER_UP_WEIGHTS, type PowerUpType } from '../utils/Constants';
import { chance, pickWeighted } from '../utils/Random';

const MAX_STORED = 3;

export class PowerUpManager {
  private readonly activePowerUps = new Map<PowerUpType, number>();
  private readonly storedPowerUps: PowerUpType[] = [];

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

  deactivate(type: PowerUpType): void {
    this.activePowerUps.delete(type);
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

  /** Store a power-up for later use. Returns false if storage is full. */
  tryStore(type: PowerUpType): boolean {
    if (this.storedPowerUps.length >= MAX_STORED) return false;
    this.storedPowerUps.push(type);
    return true;
  }

  /** Consume the first stored power-up. Returns the type used, or null if empty. */
  useStored(): PowerUpType | null {
    const type = this.storedPowerUps.shift();
    if (!type) return null;
    if (type !== 'laser' && type !== 'nuke') this.activate(type);
    return type;
  }

  getStored(): readonly PowerUpType[] {
    return this.storedPowerUps;
  }

  hasStoredSlot(): boolean {
    return this.storedPowerUps.length < MAX_STORED;
  }

  /** Clear all currently active power-ups (EMP effect). */
  clearActive(): void {
    this.activePowerUps.clear();
  }

  shouldDrop(): boolean {
    return chance(POWER_UP_DROP_CHANCE);
  }

  getRandomType(): PowerUpType {
    return pickWeighted(POWER_UP_TYPES.map(value => ({ value, weight: POWER_UP_WEIGHTS[value] })));
  }

  /** Returns active types with less than `thresholdMs` remaining. */
  getExpiringTypes(thresholdMs: number): PowerUpType[] {
    return Array.from(this.activePowerUps.entries())
      .filter(([, ms]) => ms <= thresholdMs)
      .map(([type]) => type);
  }
}
