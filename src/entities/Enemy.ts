import Phaser from 'phaser';
import { ENEMY_CONFIGS, type EnemyType } from '../utils/Constants';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private enemyType: EnemyType = 'small';
  private hitPoints = 1;
  private baseSpeed = 0;
  private baseTint = 0xffffff;
  private pointValue = 0;
  private shootCooldownMs = 0;
  private shootIntervalMs = 0;
  private movementFactor = 1;
  private movementTimeMs = 0;
  private movementPhase = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, type: EnemyType, speedMultiplier: number) {
    super(scene, x, y, ENEMY_CONFIGS[type].texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.allowGravity = false;
    this.configure(type, speedMultiplier);
  }

  configure(type: EnemyType, speedMultiplier: number): void {
    const config = ENEMY_CONFIGS[type];
    this.enemyType = type;
    this.hitPoints = config.health;
    this.baseSpeed = config.speed * speedMultiplier;
    this.baseTint = config.tint;
    this.pointValue = config.points;
    this.movementFactor = 1;
    this.movementTimeMs = 0;
    this.movementPhase = Math.random() * Math.PI * 2;

    this.setTexture(config.texture);
    this.setScale(config.scale);
    this.setTint(config.tint);
    this.setVelocityY(this.baseSpeed);
    this.shootIntervalMs =
      type === 'destroyer' ? 1_250 :
      type === 'bomber' ? 1_450 :
      type === 'heavy' ? 2_000 :
      type === 'striker' ? 2_200 :
      type === 'medium' ? 3_200 :
      0;
    this.shootCooldownMs = this.shootIntervalMs * (0.5 + Math.random() * 0.5);
  }

  applyHenchmanTier(tier: number): void {
    if (tier <= 1) return;

    const tierBonus = tier - 1;
    const healthBonus = this.enemyType === 'small'
      ? tierBonus
      : this.enemyType === 'medium'
        ? tierBonus * 2
        : tierBonus * 3;
    const pointsBonus = this.enemyType === 'small'
      ? tierBonus * 8
      : this.enemyType === 'medium'
        ? tierBonus * 12
        : tierBonus * 20;
    const speedMultiplier = 1 + tierBonus * 0.09;

    this.hitPoints += healthBonus;
    this.pointValue += pointsBonus;
    this.baseSpeed *= speedMultiplier;
    this.setVelocityY(this.baseSpeed);

    if (this.shootIntervalMs > 0) {
      const fireRateMultiplier = Math.max(0.55, 1 - tierBonus * 0.05);
      this.shootIntervalMs = Math.max(450, Math.round(this.shootIntervalMs * fireRateMultiplier));
      this.shootCooldownMs = this.shootIntervalMs * (0.35 + Math.random() * 0.45);
    }

    const tint = Phaser.Display.Color.IntegerToColor(this.baseTint);
    const lift = Math.min(120, tierBonus * 18);
    this.baseTint = Phaser.Display.Color.GetColor(
      Math.min(255, tint.red + lift),
      Math.min(255, tint.green + Math.floor(lift * 0.7)),
      Math.min(255, tint.blue + Math.floor(lift * 0.3)),
    );
    this.setTint(this.baseTint);
  }

  getPoints(): number {
    return this.pointValue;
  }

  getTintColor(): number {
    return this.baseTint;
  }

  getEnemyType(): EnemyType {
    return this.enemyType;
  }

  applyMovementFactor(factor: number): void {
    this.movementFactor = factor;
    this.updateMovement();
  }

  updateShootTimer(deltaMs: number, onFire: (x: number, y: number, vx: number, vy: number) => void): void {
    if (this.shootIntervalMs === 0 || this.y < 0) return;
    this.shootCooldownMs -= deltaMs;
    if (this.shootCooldownMs <= 0) {
      this.shootCooldownMs = this.shootIntervalMs;
      this.firePattern(onFire);
    }
  }

  damage(amount: number): boolean {
    this.hitPoints -= amount;
    if (this.hitPoints <= 0) {
      return true;
    }

    this.setTint(0xffffff);
    this.scene.time.delayedCall(60, () => {
      if (this.active) {
        this.setTint(this.baseTint);
      }
    });
    return false;
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    this.movementTimeMs += delta;
    this.updateMovement();
    if (this.y > this.scene.scale.height + 48) {
      this.destroy();
    }
  }

  private updateMovement(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    const movementTime = this.movementTimeMs / 1000;
    const verticalSpeed = this.baseSpeed * this.movementFactor;
    let horizontalSpeed = 0;

    switch (this.enemyType) {
      case 'striker':
        horizontalSpeed = Math.sin(movementTime * 6 + this.movementPhase) * 150 * this.movementFactor;
        break;
      case 'bomber':
        horizontalSpeed = Math.sin(movementTime * 2.6 + this.movementPhase) * 82 * this.movementFactor;
        break;
      case 'destroyer':
        horizontalSpeed = Math.sin(movementTime * 1.4 + this.movementPhase) * 48 * this.movementFactor;
        break;
      case 'heavy':
        horizontalSpeed = Math.sin(movementTime * 1.2 + this.movementPhase) * 26 * this.movementFactor;
        break;
      case 'medium':
        horizontalSpeed = Math.sin(movementTime * 2.1 + this.movementPhase) * 38 * this.movementFactor;
        break;
      default:
        horizontalSpeed = Math.sin(movementTime * 1.8 + this.movementPhase) * 18 * this.movementFactor;
        break;
    }

    body.setVelocity(horizontalSpeed, verticalSpeed);
  }

  private firePattern(onFire: (x: number, y: number, vx: number, vy: number) => void): void {
    const x = this.x;
    const y = this.y + 16;
    switch (this.enemyType) {
      case 'striker':
        onFire(x - 8, y, -130, 310);
        onFire(x + 8, y, 130, 310);
        break;
      case 'bomber':
        onFire(x, y, 0, 260);
        onFire(x - 12, y + 2, -90, 250);
        onFire(x + 12, y + 2, 90, 250);
        break;
      case 'destroyer':
        onFire(x, y, 0, 300);
        onFire(x - 16, y + 1, -110, 285);
        onFire(x + 16, y + 1, 110, 285);
        break;
      case 'heavy':
        onFire(x, y, 0, 300);
        onFire(x - 10, y, -70, 280);
        onFire(x + 10, y, 70, 280);
        break;
      case 'medium':
        onFire(x, y, 0, 300);
        break;
      default:
        break;
    }
  }
}
