import { PERKS, PERK_RARITY_WEIGHTS, type PerkDef, type PerkRarity } from '../utils/Constants';

const DRAFT_SIZE = 3;

export class PerkManager {
  private readonly activePerks = new Set<string>();

  hasPerk(id: string): boolean {
    return this.activePerks.has(id);
  }

  addPerk(id: string): void {
    this.activePerks.add(id);
  }

  getActivePerks(): string[] {
    return [...this.activePerks];
  }

  reset(): void {
    this.activePerks.clear();
  }

  /** Returns DRAFT_SIZE unique perks weighted by rarity, excluding already-owned. */
  getDraftChoices(): PerkDef[] {
    const pool = PERKS.filter(p => !this.activePerks.has(p.id));
    if (pool.length <= DRAFT_SIZE) return [...pool];

    const chosen: PerkDef[] = [];
    const remaining = [...pool];

    while (chosen.length < DRAFT_SIZE && remaining.length > 0) {
      const totalWeight = remaining.reduce((sum, p) => sum + PERK_RARITY_WEIGHTS[p.rarity], 0);
      let roll = Math.random() * totalWeight;
      for (let i = 0; i < remaining.length; i++) {
        roll -= PERK_RARITY_WEIGHTS[remaining[i].rarity as PerkRarity];
        if (roll <= 0) {
          chosen.push(remaining.splice(i, 1)[0]);
          break;
        }
      }
    }

    return chosen;
  }

  // ── Stat multipliers ──────────────────────────────────────────────────────

  /** Fire cooldown multiplier (<1 = faster). */
  getFireRateMod(): number {
    let mod = 1;
    if (this.hasPerk('fire-rate'))    mod *= 0.82;
    if (this.hasPerk('turbo-fire'))   mod *= 0.60;
    if (this.hasPerk('all-speed'))    mod *= 0.75;
    return mod;
  }

  /** Bullet speed multiplier (>1 = faster). */
  getBulletSpeedMod(): number {
    let mod = 1;
    if (this.hasPerk('faster-bullets')) mod *= 1.25;
    if (this.hasPerk('turbo-fire'))     mod *= 1.20;
    if (this.hasPerk('all-speed'))      mod *= 1.25;
    return mod;
  }

  /** Movement speed multiplier. */
  getMovementSpeedMod(): number {
    let mod = 1;
    if (this.hasPerk('speed-boost')) mod *= 1.15;
    if (this.hasPerk('all-speed'))   mod *= 1.25;
    return mod;
  }

  /** Score multiplier (>1 = more). */
  getScoreMod(): number {
    let mod = 1;
    if (this.hasPerk('score-bonus'))  mod *= 1.35;
    if (this.hasPerk('score-x2'))     mod *= 1.60;
    if (this.hasPerk('double-score')) mod *= 2.00;
    return mod;
  }

  /** Power-up duration multiplier. */
  getPowerUpDurationMod(): number {
    let mod = 1;
    if (this.hasPerk('longer-powerups'))  mod *= 1.30;
    if (this.hasPerk('powerup-duration')) mod *= 1.60;
    if (this.hasPerk('overcharge'))       mod *= 1.80;
    return mod;
  }

  /** Extra seconds before combo resets. */
  getComboTimerBonus(): number {
    return this.hasPerk('combo-timer') ? 2 : 0;
  }

  /** Max combo tier (normally 5). */
  getMaxComboMultiplier(): number {
    return this.hasPerk('combo-cap') ? 8 : 5;
  }

  /** Survival pts/sec bonus. */
  getSurvivalBonus(): number {
    return this.hasPerk('survival-bonus') ? 3 : 0;
  }

  /** Power-up magnet extra radius in pixels. */
  getMagnetRadius(): number {
    return this.hasPerk('powerup-magnet') ? 80 : 0;
  }

  /** Whether combo should survive taking damage. */
  comboPersistsOnDamage(): boolean {
    return this.hasPerk('combo-persist');
  }

  /** Enemy global speed reduction factor (0–1, applied as multiplier). */
  getEnemySlowMod(): number {
    return this.hasPerk('enemy-slow') ? 0.88 : 1;
  }

  /** Power-up drop chance bonus (additive). */
  getDropChanceBonus(): number {
    return this.hasPerk('rich-drops') ? 0.11 : 0;
  }

  /** Whether shield absorbs 2 hits instead of 1. */
  hasTougherShield(): boolean {
    return this.hasPerk('tougher-shield');
  }

  /** Whether shield should regenerate (1 stack per 20s). */
  hasShieldRegen(): boolean {
    return this.hasPerk('shield-regen');
  }

  /** Whether ghost mode (extra invulnerability) is active. */
  hasGhostMode(): boolean {
    return this.hasPerk('ghost-mode');
  }

  /** Whether bullet storm (5-bullet fan) is active. */
  hasBulletStorm(): boolean {
    return this.hasPerk('bullet-storm');
  }

  /** Whether armor piercing perk is active. */
  hasPiercingPerk(): boolean {
    return this.hasPerk('piercing-perk');
  }

  /** Whether side cannons (extra angled bullets) perk is active. */
  hasSideCannons(): boolean {
    return this.hasPerk('extra-bullet');
  }

  /** Whether the combo-starter perk should apply at boss start. */
  hasComboStarter(): boolean {
    return this.hasPerk('combo-starter');
  }
}
