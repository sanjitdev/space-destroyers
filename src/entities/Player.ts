import Phaser from 'phaser';
import {
  PLAYER_FIRE_COOLDOWN_MS,
  PLAYER_INVULNERABILITY_MS,
  PLAYER_LIVES,
  PLAYER_MAX_LIVES,
  PLAYER_SPEED,
  POWER_UP_TINTS,
  type PowerUpType,
  type ShipConfig,
} from '../utils/Constants';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private lives = PLAYER_LIVES;
  private fireCooldownMs = 0;
  private invulnerabilityMs = 0;
  private autoFireEnabled = false;
  private readonly shipSpeed: number;
  private readonly shipCooldownMod: number;

  constructor(scene: Phaser.Scene, x: number, y: number, ship: ShipConfig) {
    super(scene, x, y, ship.texture);
    this.shipSpeed = PLAYER_SPEED * ship.speedMod;
    this.shipCooldownMod = ship.cooldownMod;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.allowGravity = false;
    this.setCollideWorldBounds(true);
    this.setDepth(5);
    this.setScale(ship.gameScale);
    // Constrain physics body to the core hull (excludes wings/exhaust extremities)
    body.setSize(this.displayWidth * 0.52, this.displayHeight * 0.48);
  }

  update(deltaMs: number, horizontalInput: number, touchTargetX: number | null): void {
    this.fireCooldownMs = Math.max(0, this.fireCooldownMs - deltaMs);
    this.invulnerabilityMs = Math.max(0, this.invulnerabilityMs - deltaMs);

    if (touchTargetX !== null) {
      const desiredVelocity = Phaser.Math.Clamp((touchTargetX - this.x) * 7, -this.shipSpeed, this.shipSpeed);
      this.setVelocityX(desiredVelocity);
    } else {
      this.setVelocityX(horizontalInput * this.shipSpeed);
    }

    if (this.invulnerabilityMs > 0) {
      this.alpha = 0.45 + Math.abs(Math.sin(this.invulnerabilityMs / 90)) * 0.45;
    } else {
      this.alpha = 1;
    }
  }

  canFire(): boolean {
    return this.fireCooldownMs <= 0;
  }

  consumeFireCooldown(rapidFire: boolean): void {
    const base = PLAYER_FIRE_COOLDOWN_MS * this.shipCooldownMod;
    this.fireCooldownMs = rapidFire ? base / 2 : base;
  }

  takeDamage(shielded: boolean): boolean {
    if (shielded || this.invulnerabilityMs > 0) {
      return false;
    }

    this.lives -= 1;
    this.invulnerabilityMs = PLAYER_INVULNERABILITY_MS;
    return true;
  }

  getLives(): number {
    return this.lives;
  }

  isOutOfLives(): boolean {
    return this.lives <= 0;
  }

  /** Adds one life, capped at PLAYER_MAX_LIVES. Returns true if gained. */
  addLife(): boolean {
    if (this.lives >= PLAYER_MAX_LIVES) return false;
    this.lives++;
    return true;
  }

  toggleAutoFire(): void {
    this.autoFireEnabled = !this.autoFireEnabled;
  }

  isAutoFireEnabled(): boolean {
    return this.autoFireEnabled;
  }

  setPowerGlow(activeTypes: PowerUpType[]): void {
    if (activeTypes.length === 0) {
      this.setTint(0xffffff);
      this.setScale(1);
      return;
    }

    const primaryType = activeTypes.includes('shield') ? 'shield' : activeTypes[0];
    this.setTint(POWER_UP_TINTS[primaryType]);
    this.setScale(1.04 + activeTypes.length * 0.02);
  }
}
