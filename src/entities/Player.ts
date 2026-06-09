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

const MIN_Y = 188; // below taller HUD + boss objective area + margin

export class Player extends Phaser.Physics.Arcade.Sprite {
  private lives = PLAYER_LIVES;
  private fireCooldownMs = 0;
  private invulnerabilityMs = 0;
  private autoFireEnabled = false;
  private shipSpeed: number;
  private shipCooldownMod: number;
  private baseScale = 1;
  private readonly exhaustEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, x: number, y: number, ship: ShipConfig) {
    super(scene, x, y, ship.texture);
    this.shipSpeed = PLAYER_SPEED;
    this.shipCooldownMod = 1;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.allowGravity = false;
    this.setCollideWorldBounds(true);
    this.setDepth(5);
    this.applyShipConfig(ship);

    this.exhaustEmitter = scene.add.particles(x, y, 'particle', {
      lifespan: 320,
      speed: { min: 30, max: 80 },
      angle: { min: 80, max: 100 },
      scale: { start: 0.55, end: 0 },
      alpha: { start: 0.75, end: 0 },
      tint: [0x57e2e5, 0x6cf3ff, 0xffffff],
      frequency: 30,
      blendMode: Phaser.BlendModes.ADD,
      quantity: 2,
    }).setDepth(4);
  }

  applyShipConfig(ship: ShipConfig): void {
    this.shipSpeed = PLAYER_SPEED * ship.speedMod;
    this.shipCooldownMod = ship.cooldownMod;
    this.baseScale = ship.gameScale;
    this.setTexture(ship.texture);
    this.setScale(this.baseScale);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(this.displayWidth * 0.52, this.displayHeight * 0.48);
  }

  update(
    deltaMs: number,
    horizontalInput: number,
    verticalInput: number,
    touchTargetX: number | null,
    touchTargetY: number | null,
  ): void {
    this.fireCooldownMs = Math.max(0, this.fireCooldownMs - deltaMs);
    this.invulnerabilityMs = Math.max(0, this.invulnerabilityMs - deltaMs);

    // Horizontal
    if (touchTargetX !== null) {
      const desiredVelocity = Phaser.Math.Clamp((touchTargetX - this.x) * 7, -this.shipSpeed, this.shipSpeed);
      this.setVelocityX(desiredVelocity);
    } else {
      this.setVelocityX(horizontalInput * this.shipSpeed);
    }

    // Vertical (75% of horizontal speed so the game stays readable)
    if (touchTargetY !== null) {
      const dvy = Phaser.Math.Clamp((touchTargetY - this.y) * 7, -this.shipSpeed * 0.75, this.shipSpeed * 0.75);
      this.setVelocityY(dvy);
    } else {
      this.setVelocityY(verticalInput * this.shipSpeed * 0.75);
    }

    // Prevent player from going into HUD area
    if (this.y < MIN_Y) {
      this.y = MIN_Y;
      (this.body as Phaser.Physics.Arcade.Body).velocity.y = 0;
    }

    if (this.invulnerabilityMs > 0) {
      this.alpha = 0.45 + Math.abs(Math.sin(this.invulnerabilityMs / 90)) * 0.45;
    } else {
      this.alpha = 1;
    }

    this.exhaustEmitter.setPosition(this.x, this.y + this.displayHeight * 0.42);
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
      this.setScale(this.baseScale);
      return;
    }

    const primaryType = activeTypes.includes('shield') ? 'shield' : activeTypes[0];
    this.setTint(POWER_UP_TINTS[primaryType]);
    this.setScale(this.baseScale * (1.04 + activeTypes.length * 0.02));
  }
}
