import Phaser from 'phaser';
import { ENEMY_CONFIGS, type EnemyType } from '../utils/Constants';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private enemyType: EnemyType = 'small';
  private hitPoints = 1;
  private baseSpeed = 0;
  private baseTint = 0xffffff;
  private pointValue = 0;

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

    this.setTexture(config.texture);
    this.setScale(config.scale);
    this.setTint(config.tint);
    this.setVelocityY(this.baseSpeed);
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
    this.setVelocityY(this.baseSpeed * factor);
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
    if (this.y > this.scene.scale.height + 48) {
      this.destroy();
    }
  }
}
