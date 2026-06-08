import Phaser from 'phaser';
import {
  PLAYER_FIRE_COOLDOWN_MS,
  PLAYER_INVULNERABILITY_MS,
  PLAYER_LIVES,
  PLAYER_SPEED,
  POWER_UP_TINTS,
  type PowerUpType,
} from '../utils/Constants';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private lives = PLAYER_LIVES;
  private fireCooldownMs = 0;
  private invulnerabilityMs = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.allowGravity = false;
    this.setCollideWorldBounds(true);
    this.setDepth(5);
  }

  update(deltaMs: number, horizontalInput: number, touchTargetX: number | null): void {
    this.fireCooldownMs = Math.max(0, this.fireCooldownMs - deltaMs);
    this.invulnerabilityMs = Math.max(0, this.invulnerabilityMs - deltaMs);

    if (touchTargetX !== null) {
      const desiredVelocity = Phaser.Math.Clamp((touchTargetX - this.x) * 7, -PLAYER_SPEED, PLAYER_SPEED);
      this.setVelocityX(desiredVelocity);
    } else {
      this.setVelocityX(horizontalInput * PLAYER_SPEED);
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
    this.fireCooldownMs = rapidFire ? PLAYER_FIRE_COOLDOWN_MS / 2 : PLAYER_FIRE_COOLDOWN_MS;
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
