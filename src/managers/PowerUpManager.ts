import { POWER_UP_DROP_CHANCE, POWER_UP_LABELS, POWER_UP_TYPES, POWER_UP_WEIGHTS, type PowerUpType } from '../utils/Constants';
import { chance, pickWeighted } from '../utils/Random';

const MAX_STORED = 3;
const MAX_SHIELD_STACKS = 3;
const RIBBON_LASER_DURATION_MS = 15_000;

export class PowerUpManager {
  private readonly activePowerUps = new Set<PowerUpType>();
  private readonly storedPowerUps: PowerUpType[] = [];
  private shieldCharges = 0;
  private ribbonLaserRemainingMs = 0;

  update(deltaMs: number): void {
    if (this.activePowerUps.has('ribbonLaser')) {
      this.ribbonLaserRemainingMs = Math.max(0, this.ribbonLaserRemainingMs - deltaMs);
      if (this.ribbonLaserRemainingMs <= 0) {
        this.activePowerUps.delete('ribbonLaser');
      }
    }
  }

  activate(type: PowerUpType): void {
    if (type === 'shield') {
      this.shieldCharges = Math.min(MAX_SHIELD_STACKS, this.shieldCharges + 1);
      return;
    }
    if (type === 'ribbonLaser') {
      this.activePowerUps.add(type);
      this.ribbonLaserRemainingMs = RIBBON_LASER_DURATION_MS;
      return;
    }
    this.activePowerUps.add(type);
  }

  deactivate(type: PowerUpType): void {
    if (type === 'shield') {
      this.shieldCharges = 0;
      return;
    }
    if (type === 'ribbonLaser') {
      this.ribbonLaserRemainingMs = 0;
    }
    this.activePowerUps.delete(type);
  }

  isActive(type: PowerUpType): boolean {
    if (type === 'shield') {
      return this.shieldCharges > 0;
    }
    return this.activePowerUps.has(type);
  }

  getActiveTypes(): PowerUpType[] {
    const types = Array.from(this.activePowerUps);
    if (this.shieldCharges > 0) types.push('shield');
    return types;
  }

  getDisplayItems(): string[] {
    return this.getActiveTypes().map((type) => {
      if (type === 'shield') {
        return this.shieldCharges > 1 ? `Shield x${this.shieldCharges}` : POWER_UP_LABELS[type];
      }
      return POWER_UP_LABELS[type];
    });
  }

  consumeShieldCharge(): number {
    if (this.shieldCharges <= 0) return 0;
    this.shieldCharges -= 1;
    return this.shieldCharges;
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

  clearStored(): void {
    this.storedPowerUps.length = 0;
  }

  /** Clear all currently active power-ups (called on player damage or EMP). */
  clearActive(): void {
    this.activePowerUps.clear();
    this.shieldCharges = 0;
    this.ribbonLaserRemainingMs = 0;
  }

  shouldDrop(): boolean {
    return chance(POWER_UP_DROP_CHANCE);
  }

  getRandomType(): PowerUpType {
    return pickWeighted(POWER_UP_TYPES.map(value => ({ value, weight: POWER_UP_WEIGHTS[value] })));
  }
}
